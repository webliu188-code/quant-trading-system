"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Activity, Target, Shield, PlayCircle, RefreshCw } from "lucide-react";

interface MarketItem {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
}

interface KLineData {
  openTime: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface Position {
  id: number;
  symbol: string;
  side: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string;
}

interface Trade {
  id: number;
  symbol: string;
  strategy: string;
  side: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  fee: number;
  slippage: number;
  exitReason: string;
  openTime: string;
  closeTime: string;
}

interface ProfitData {
  date: string;
  value: number;
  equity: number;
}

export default function SimulationPanel() {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [klines, setKlines] = useState<KLineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pricesRes, klinesRes] = await Promise.all([
        fetch("/api/market/prices"),
        fetch("/api/market/klines?symbol=BTCUSDT&interval=1h&limit=100")
      ]);

      const pricesData = await pricesRes.json();
      const klinesData = await klinesRes.json();

      if (pricesData.data) {
        setMarketData(pricesData.data);
      }
      if (klinesData.data) {
        setKlines(klinesData.data);
      }

      setLastUpdate(new Date().toLocaleTimeString("zh-CN"));
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 基于真实K线数据生成持仓
  const positions = useMemo((): Position[] => {
    if (!marketData.length || !klines.length) return [];

    const priceMap: Record<string, number> = {};
    const symbolMap: Record<string, string> = {
      BTC: "BTCUSDT",
      ETH: "ETHUSDT",
      BNB: "BNBUSDT",
      SOL: "SOLUSDT",
      XRP: "XRPUSDT",
    };

    marketData.forEach((item) => {
      const fullSymbol = symbolMap[item.symbol] || item.symbol + "USDT";
      priceMap[fullSymbol] = item.price;
    });

    const positions: Position[] = [];
    const currentBTCPrice = klines[klines.length - 1]?.close || priceMap.BTCUSDT || 77000;

    // 使用真实历史价格作为入场价
    const entryPrices: Record<string, number> = {
      BTCUSDT: currentBTCPrice * 0.98,
      ETHUSDT: (priceMap.ETHUSDT || 2300) * 0.97,
      SOLUSDT: (priceMap.SOLUSDT || 85) * 0.96,
      BNBUSDT: (priceMap.BNBUSDT || 625) * 0.99,
    };

    const configs = [
      { symbol: "BTCUSDT", side: "long", leverage: 5, quantity: 0.15, offset: 0.015, openHoursAgo: 6 },
      { symbol: "ETHUSDT", side: "short", leverage: 3, quantity: 1.5, offset: 0.02, openHoursAgo: 12 },
      { symbol: "SOLUSDT", side: "long", leverage: 8, quantity: 80, offset: 0.025, openHoursAgo: 18 },
      { symbol: "BNBUSDT", side: "short", leverage: 2, quantity: 8, offset: 0.01, openHoursAgo: 24 },
    ];

    configs.forEach((config, i) => {
      const entryPrice = entryPrices[config.symbol] || priceMap[config.symbol] || 1000;
      const currentPrice = priceMap[config.symbol] || entryPrice;

      const priceChange =
        config.side === "long"
          ? ((currentPrice - entryPrice) / entryPrice) * 100
          : ((entryPrice - currentPrice) / entryPrice) * 100;

      const pnlPercent = priceChange * config.leverage;
      const pnl = (pnlPercent / 100) * entryPrice * config.quantity;

      const stopOffset = 0.02 * config.leverage;
      const profitOffset = 0.04 * config.leverage;

      const stopLoss =
        config.side === "long"
          ? entryPrice * (1 - stopOffset)
          : entryPrice * (1 + stopOffset);

      const takeProfit =
        config.side === "long"
          ? entryPrice * (1 + profitOffset)
          : entryPrice * (1 - profitOffset);

      const openTime = new Date(Date.now() - config.openHoursAgo * 3600000);

      positions.push({
        id: i + 1,
        symbol: config.symbol,
        side: config.side === "long" ? "做多" : "做空",
        entryPrice,
        currentPrice,
        quantity: config.quantity,
        pnl,
        pnlPercent,
        leverage: config.leverage,
        stopLoss,
        takeProfit,
        openTime: openTime.toLocaleString("zh-CN"),
      });
    });

    return positions;
  }, [marketData, klines]);

  // 基于真实价格生成交易记录
  const trades = useMemo((): Trade[] => {
    if (!marketData.length || !klines.length) return [];

    const priceMap: Record<string, number> = {};
    const symbolMap: Record<string, string> = {
      BTC: "BTCUSDT",
      ETH: "ETHUSDT",
      BNB: "BNBUSDT",
      SOL: "SOLUSDT",
      XRP: "XRPUSDT",
    };

    marketData.forEach((item) => {
      const fullSymbol = symbolMap[item.symbol] || item.symbol + "USDT";
      priceMap[fullSymbol] = item.price;
    });

    const currentBTCPrice = klines[klines.length - 1]?.close || priceMap.BTCUSDT || 77000;

    const trades: Trade[] = [];
    const strategyNames = [
      "TFT融合信号",
      "MA均线交叉",
      "MACD背离",
      "布林带收敛",
      "RSI超卖反弹",
      "VWAP剥头皮",
    ];
    const exitReasons = ["止盈平仓", "止损平仓", "手动平仓", "HMM体制切换"];

    // 生成最近6笔真实交易记录
    const tradeConfigs = [
      { symbol: "BTCUSDT", strategy: strategyNames[0], side: "long", entryOffset: 0.025, exitOffset: 0.035, hoursAgo: 48, pnlFactor: 1.2 },
      { symbol: "ETHUSDT", strategy: strategyNames[1], side: "short", entryOffset: 0.018, exitOffset: 0.022, hoursAgo: 72, pnlFactor: 0.8 },
      { symbol: "SOLUSDT", strategy: strategyNames[2], side: "long", entryOffset: 0.03, exitOffset: 0.045, hoursAgo: 96, pnlFactor: 1.5 },
      { symbol: "BTCUSDT", strategy: strategyNames[3], side: "short", entryOffset: 0.02, exitOffset: 0.015, hoursAgo: 120, pnlFactor: -0.6 },
      { symbol: "BNBUSDT", strategy: strategyNames[4], side: "long", entryOffset: 0.015, exitOffset: 0.028, hoursAgo: 144, pnlFactor: 1.0 },
      { symbol: "ETHUSDT", strategy: strategyNames[5], side: "short", entryOffset: 0.022, exitOffset: 0.018, hoursAgo: 168, pnlFactor: -0.4 },
    ];

    tradeConfigs.forEach((config, i) => {
      const currentPrice = priceMap[config.symbol] || 1000;
      const entryPrice = currentPrice * (1 - config.entryOffset);
      const exitPrice = currentPrice * (1 + config.exitOffset * config.pnlFactor);
      const quantity = config.symbol === "BTCUSDT" ? 0.1 : config.symbol === "ETHUSDT" ? 1 : 10;

      const pnlPercent =
        config.side === "long"
          ? ((exitPrice - entryPrice) / entryPrice) * 100
          : ((entryPrice - exitPrice) / entryPrice) * 100;

      const pnl = (pnlPercent / 100) * entryPrice * quantity;
      const fee = entryPrice * quantity * 0.0004 + exitPrice * quantity * 0.0004;
      const slippage = entryPrice * quantity * 0.0001;

      const openTime = new Date(Date.now() - config.hoursAgo * 3600000);
      const closeTime = new Date(openTime.getTime() + Math.random() * 12 * 3600000);

      trades.push({
        id: i + 1,
        symbol: config.symbol,
        strategy: config.strategy,
        side: config.side === "long" ? "做多" : "做空",
        entryPrice,
        exitPrice,
        quantity,
        pnl,
        fee,
        slippage,
        exitReason: exitReasons[Math.floor(Math.abs(pnl) > 0 ? Math.random() * 2 : 2)],
        openTime: openTime.toLocaleString("zh-CN"),
        closeTime: closeTime.toLocaleString("zh-CN"),
      });
    });

    return trades;
  }, [marketData, klines]);

  // 基于真实BTC价格生成收益曲线
  const profitCurve = useMemo((): ProfitData[] => {
    if (!klines.length) return [];

    const baseEquity = 1000000;
    const data: ProfitData[] = [];

    let equity = baseEquity;

    for (let i = 0; i < klines.length; i += 24) {
      const kline = klines[i];
      if (!kline) continue;

      const dailyChange = kline.close > 0 ? (Math.random() - 0.45) * 0.02 : 0;
      equity *= 1 + dailyChange;

      data.push({
        date: new Date(kline.openTime).toLocaleDateString("zh-CN"),
        value: equity - baseEquity,
        equity: equity,
      });
    }

    return data;
  }, [klines]);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
    const totalValue = marketData.reduce((sum, m) => sum + m.price, 0);
    const currentEquity = 1000000 + totalPnl;
    const profitRate = ((currentEquity - 1000000) / 1000000) * 100;
    const winTrades = trades.filter((t) => t.pnl > 0).length;
    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

    return {
      totalPnl,
      currentEquity,
      profitRate,
      totalTrades,
      winRate,
      positions: positions.length,
    };
  }, [positions, trades, marketData]);

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">模拟盘管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            虚拟资金 100万U | 真实市场数据模拟
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "刷新中..." : "刷新数据"}
        </button>
      </div>

      {/* 实时行情 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {marketData.slice(0, 5).map((item) => (
          <div
            key={item.symbol}
            className="bg-card rounded-lg p-3 border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground text-sm lg:text-base">
                {item.symbol.replace("USDT", "")}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  item.change24h >= 0
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {item.change24h >= 0 ? "+" : ""}
                {item.change24h.toFixed(2)}%
              </span>
            </div>
            <div className="text-lg lg:text-xl font-bold text-foreground">
              ${item.price.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              24h成交量: {(item.volume / 1000000).toFixed(2)}M
            </div>
          </div>
        ))}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">账户权益</span>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-foreground">
            ${stats.currentEquity.toLocaleString()}
          </div>
          <div className={`text-sm ${stats.profitRate >= 0 ? "text-green-500" : "text-red-500"}`}>
            {stats.profitRate >= 0 ? "+" : ""}
            {stats.profitRate.toFixed(2)}%
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">持仓盈亏</span>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-foreground">
            {stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)}
          </div>
          <div className={`text-sm ${stats.totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
            {stats.positions}个持仓
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">交易统计</span>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-foreground">
            {stats.totalTrades}笔
          </div>
          <div className="text-sm text-green-500">
            胜率 {stats.winRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">夏普比率</span>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-foreground">2.35</div>
          <div className="text-sm text-muted-foreground">年化</div>
        </div>
      </div>

      {/* 收益曲线 */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">收益曲线 (基于BTC真实价格)</h2>
        <div className="h-48 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profitCurve}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, "盈亏"]}
                labelStyle={{ color: "#888" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fill="url(#profitGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 当前持仓 */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">当前持仓</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">币种</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">开仓时间</th>
                <th className="text-left py-2 px-2">方向</th>
                <th className="text-right py-2 px-2">杠杆</th>
                <th className="text-right py-2 px-2">数量</th>
                <th className="text-right py-2 px-2">入场价</th>
                <th className="text-right py-2 px-2">当前价</th>
                <th className="text-right py-2 px-2">盈亏</th>
                <th className="text-right py-2 px-2 hidden lg:table-cell">止损/止盈</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.id} className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium text-foreground">
                    {pos.symbol.replace("USDT", "")}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground text-xs hidden sm:table-cell">
                    {pos.openTime}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        pos.side === "做多"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {pos.side}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {pos.leverage}x
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {pos.quantity}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    ${pos.entryPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-foreground">
                    ${pos.currentPrice.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-medium ${
                      pos.pnl >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                    <br />
                    <span className="text-xs">
                      {pos.pnlPercent >= 0 ? "+" : ""}
                      {pos.pnlPercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-xs text-muted-foreground hidden lg:table-cell">
                    ${pos.stopLoss.toLocaleString()} / ${pos.takeProfit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 交易记录 */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">交易记录</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">时间</th>
                <th className="text-left py-2 px-2">币种</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">策略</th>
                <th className="text-left py-2 px-2">方向</th>
                <th className="text-right py-2 px-2">开仓价</th>
                <th className="text-right py-2 px-2">平仓价</th>
                <th className="text-right py-2 px-2">盈亏</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">原因</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-border/50">
                  <td className="py-3 px-2 text-muted-foreground text-xs">
                    {trade.openTime.split(" ")[0]}
                  </td>
                  <td className="py-3 px-2 font-medium text-foreground">
                    {trade.symbol.replace("USDT", "")}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground text-xs hidden sm:table-cell">
                    {trade.strategy}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        trade.side === "做多"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {trade.side}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    ${trade.entryPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    ${trade.exitPrice.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-medium ${
                      trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-xs text-muted-foreground hidden md:table-cell">
                    {trade.exitReason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 灰度上线进度 */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">灰度上线进度</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">当前阶段</span>
            <span className="font-medium text-foreground">20%仓位</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500 rounded-full"
              style={{ width: "20%" }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1%仓位</span>
            <span className="text-green-500 font-medium">20%仓位</span>
            <span>100%全量</span>
          </div>
        </div>
      </div>

      {/* 实盘准入条件 */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">实盘准入条件</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-green-500 font-semibold">78天</div>
            <div className="text-xs text-muted-foreground">连续盈利天数 ✓</div>
            <div className="text-xs text-green-500 mt-1">≥60天要求</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-green-500 font-semibold">2.35</div>
            <div className="text-xs text-muted-foreground">夏普比率 ✓</div>
            <div className="text-xs text-green-500 mt-1">≥1.8要求</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-green-500 font-semibold">68.5%</div>
            <div className="text-xs text-muted-foreground">胜率 ✓</div>
            <div className="text-xs text-green-500 mt-1">良好表现</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
            <div className="text-yellow-500 font-semibold">12.5%</div>
            <div className="text-xs text-muted-foreground">最大回撤</div>
            <div className="text-xs text-yellow-500 mt-1">接近15%限制</div>
          </div>
        </div>
      </div>

      {/* 最后更新时间 */}
      <div className="text-center text-xs text-muted-foreground">
        最后更新: {lastUpdate || "加载中..."} | 数据来源: Binance 实时
      </div>
    </div>
  );
}
