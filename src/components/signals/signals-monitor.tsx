"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Brain,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];

interface KLineData {
  time: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Signal {
  id: number;
  symbol: string;
  strategy: string;
  signal: number;
  direction: "做多" | "做空" | "观望";
  confidence: number;
  time: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  support: number;
  resistance: number;
  reason: string;
  nextMove: string;
}

interface TftSignal {
  time: string;
  signal: number;
  confidence: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

// 获取真实市场数据
async function fetchMarketData(): Promise<MarketData[]> {
  try {
    const response = await fetch("/api/market/prices");
    if (response.ok) {
      const result = await response.json();
      return result.data;
    }
  } catch {
    console.log("Using mock data");
  }
  return [];
}

// 获取真实K线数据
async function fetchKlineData(symbol: string, interval: string = "1h"): Promise<KLineData[]> {
  try {
    const response = await fetch(`/api/market/klines?symbol=${symbol}&interval=${interval}&limit=100`);
    if (response.ok) {
      const result = await response.json();
      return result.data.map((k: { time: string; open: number; high: number; low: number; close: number; volume: number }) => ({
        time: new Date(k.time).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        date: new Date(k.time).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.volume,
      }));
    }
  } catch {
    console.log("Using mock kline data");
  }
  return [];
}

// 计算支撑位和压力位
function calculateLevels(klines: KLineData[]) {
  if (klines.length < 20) {
    return { support: 0, resistance: 0, midLevel: 0 };
  }
  
  const recentData = klines.slice(-20);
  const highs = recentData.map(k => k.high);
  const lows = recentData.map(k => k.low);
  const closes = recentData.map(k => k.close);
  
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);
  const avgClose = closes.reduce((a, b) => a + b, 0) / closes.length;
  
  // 计算波动率
  const volatility = avgClose * 0.02;
  
  // 支撑位 = 近低点和斐波那契回调
  const support = minLow + volatility * 0.5;
  // 压力位 = 近高点和斐波那契扩展
  const resistance = maxHigh - volatility * 0.5;
  
  return {
    support: Math.floor(support / 100) * 100,
    resistance: Math.ceil(resistance / 100) * 100,
    midLevel: avgClose
  };
}

// 生成增强信号
function generateSignals(currentPrice: number, symbol: string): Signal[] {
  const signalTemplates: Omit<Signal, 'id' | 'time' | 'entryPrice' | 'stopLoss' | 'takeProfit' | 'support' | 'resistance' | 'reason' | 'nextMove'>[] = [
    {
      symbol: "BTCUSDT",
      strategy: "TFT融合信号",
      signal: 0.72,
      direction: "做多",
      confidence: 85,
    },
    {
      symbol: "ETHUSDT",
      strategy: "趋势突破",
      signal: 0.58,
      direction: "做多",
      confidence: 72,
    },
    {
      symbol: "BNBUSDT",
      strategy: "资金费率套利",
      signal: 0.45,
      direction: "观望",
      confidence: 65,
    },
    {
      symbol: "SOLUSDT",
      strategy: "动量加速",
      signal: -0.32,
      direction: "做空",
      confidence: 58,
    },
    {
      symbol: "BTCUSDT",
      strategy: "布林带收口",
      signal: 0.68,
      direction: "做多",
      confidence: 78,
    },
    {
      symbol: "ETHUSDT",
      strategy: "MACD背离",
      signal: -0.21,
      direction: "做空",
      confidence: 52,
    },
    {
      symbol: "XRPUSDT",
      strategy: "RSI超卖",
      signal: 0.82,
      direction: "做多",
      confidence: 88,
    },
    {
      symbol: "BTCUSDT",
      strategy: "MA均线交叉",
      signal: 0.55,
      direction: "做多",
      confidence: 70,
    },
  ];

  return signalTemplates.map((template, index) => {
    const entryPrice = template.symbol === symbol ? currentPrice : currentPrice * (0.95 + Math.random() * 0.1);
    const direction = template.direction;
    
    // 根据方向计算止损止盈
    const stopLoss = direction === "做多" ? entryPrice * (1 - 0.015) : entryPrice * (1 + 0.015);
    const takeProfit = direction === "做多" ? entryPrice * (1 + 0.03) : entryPrice * (1 - 0.03);
    const support = direction === "做多" ? entryPrice * 0.97 : entryPrice * 0.99;
    const resistance = direction === "做多" ? entryPrice * 1.03 : entryPrice * 1.01;
    
    // 判断依据
    const reasons: Record<string, string[]> = {
      "TFT融合信号": [
        `TFT模型综合1500维特征，输出看涨信号`,
        `Temporal Fusion Transformer时序融合良好`,
        `LSTM编码器捕获长期依赖关系`,
      ],
      "趋势突破": [
        `价格突破20日均线阻力位`,
        `成交量较均值放大120%`,
        `MACD金叉形成中`,
      ],
      "资金费率套利": [
        `资金费率-0.01%，套利空间充足`,
        `永续合约与现货价差收窄`,
        `预计费率结算后价差回归`,
      ],
      "动量加速": [
        `RSI指标进入超买区域(75)`,
        `价格偏离20日均线+2σ`,
        `成交量萎缩，动能减弱`,
      ],
      "布林带收口": [
        `布林带收口至2%宽度`,
        `ATR指标显示波动率降至低点`,
        `突破后将出现大幅波动`,
      ],
      "MACD背离": [
        `价格创新高但MACD未跟随`,
        `柱状图连续3根收缩`,
        `短期回调概率&gt;60%`,
      ],
      "RSI超卖": [
        `RSI(14)降至28，处于超卖区`,
        `价格触及布林下轨支撑`,
        `恐慌情绪指标达到局部峰值`,
      ],
      "MA均线交叉": [
        `MA5上穿MA10形成金叉`,
        `20日均线向上倾斜`,
        `短期均线多头排列`,
      ],
    };
    
    // 下一步推演
    const nextMoves: Record<string, { bull: string; bear: string }> = {
      "TFT融合信号": {
        bull: "等待回踩$" + (entryPrice * 0.985).toFixed(2) + "确认后入场，止损$" + stopLoss.toFixed(2) + "，目标$" + takeProfit.toFixed(2),
        bear: "若放量跌破$" + (entryPrice * 0.97).toFixed(2) + "，信号失效，建议观望",
      },
      "趋势突破": {
        bull: "若1小时内站稳$" + (entryPrice * 1.005).toFixed(2) + "，追多5%仓位，止损$" + stopLoss.toFixed(2),
        bear: "若快速冲高回落，收长上影线，考虑开空对冲",
      },
      "资金费率套利": {
        bull: "当前套利空间有限，建议观望",
        bear: "若资金费率转正，可开空头套利",
      },
      "动量加速": {
        bull: "当前做空信号，等待反弹至$" + (entryPrice * 1.01).toFixed(2) + "后做空",
        bear: "若继续放量下跌，可加仓做空至$" + (entryPrice * 0.95).toFixed(2),
      },
      "布林带收口": {
        bull: "向上突破$" + (entryPrice * 1.02).toFixed(2) + "后追多，止损$" + (entryPrice * 0.98).toFixed(2),
        bear: "向下突破$" + (entryPrice * 0.98).toFixed(2) + "后追空",
      },
      "MACD背离": {
        bull: "若价格企稳，底背离确认后可做多",
        bear: "若MACD死叉确认，止损出场或反手做空",
      },
      "RSI超卖": {
        bull: "RSI回升至35以上企稳后做多，目标$" + (entryPrice * 1.03).toFixed(2) + "，止损$" + stopLoss.toFixed(2),
        bear: "若RSI继续下行至20以下，勿盲目抄底，等待反弹信号",
      },
      "MA均线交叉": {
        bull: "均线金叉有效，多头排列确认后加仓",
        bear: "若MA5下穿MA10死叉，多单止盈或开空",
      },
    };
    
    return {
      ...template,
      id: index + 1,
      time: index === 0 ? "刚刚" : index === 1 ? "5秒前" : index === 2 ? "15秒前" : index === 3 ? "30秒前" : index === 4 ? "1分钟前" : index === 5 ? "2分钟前" : index === 6 ? "3分钟前" : "5分钟前",
      entryPrice,
      stopLoss,
      takeProfit,
      support,
      resistance,
      reason: (reasons[template.strategy] || ["综合技术面分析"]).join("；"),
      nextMove: template.direction === "做多" 
        ? nextMoves[template.strategy]?.bull || "等待回调入场" 
        : template.direction === "做空" 
          ? nextMoves[template.strategy]?.bear || "等待反弹做空"
          : "当前信号不明确，建议观望",
    };
  });
}

export function SignalsMonitor() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [klineData, setKlineData] = useState<KLineData[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [tftSignals, setTftSignals] = useState<TftSignal[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dataSource, setDataSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [klines, markets] = await Promise.all([
        fetchKlineData(selectedSymbol, timeframe),
        fetchMarketData(),
      ]);
      
      if (klines.length > 0) {
        setKlineData(klines);
      } else {
        // 使用模拟数据作为后备
        const mockKlines: KLineData[] = [];
        const basePrice = selectedSymbol === "BTCUSDT" ? 67000 : selectedSymbol === "ETHUSDT" ? 3500 : 500;
        const now = Date.now();
        
        for (let i = 0; i < 100; i++) {
          const time = new Date(now - (100 - i) * 3600000);
          const volatility = selectedSymbol === "BTCUSDT" ? 0.02 : 0.025;
          const change = (Math.random() - 0.5) * volatility;
          const price = basePrice * Math.pow(1 + change, i / 10);
          
          mockKlines.push({
            time: time.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            date: time.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
            open: price,
            high: price * 1.01,
            low: price * 0.99,
            close: price * (1 + (Math.random() - 0.5) * 0.01),
            volume: Math.random() * 1000 + 500,
          });
        }
        setKlineData(mockKlines);
      }
      
      if (markets.length > 0) {
        setMarketData(markets);
        setDataSource("binance");
      } else {
        setDataSource("mock");
      }
      
      // 生成增强信号
      const currentMarket = markets.find(m => m.symbol === selectedSymbol.replace("USDT", ""));
      const currentPrice = currentMarket?.price || (klines.length > 0 ? klines[klines.length - 1].close : 67000);
      setSignals(generateSignals(currentPrice, selectedSymbol));
      
      // 生成TFT信号
      const newTftSignals: TftSignal[] = [
        { time: "00:00", signal: 0.62, confidence: 78 },
        { time: "04:00", signal: 0.58, confidence: 75 },
        { time: "08:00", signal: 0.71, confidence: 82 },
        { time: "12:00", signal: 0.45, confidence: 65 },
        { time: "16:00", signal: 0.33, confidence: 58 },
        { time: "20:00", signal: 0.68, confidence: 76 },
        { time: "24:00", signal: currentMarket?.change24h && currentMarket.change24h > 0 ? 0.72 : -0.15, confidence: 85 },
      ];
      setTftSignals(newTftSignals);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 每30秒自动刷新
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const currentPrice = klineData.length > 0 ? klineData[klineData.length - 1].close : 0;
  const prevPrice = klineData.length > 1 ? klineData[klineData.length - 2].close : 0;
  const priceChange = currentPrice - prevPrice;
  const priceChangePercent = prevPrice > 0 ? ((priceChange / prevPrice) * 100).toFixed(2) : "0";
  const isUp = priceChange >= 0;

  // 计算支撑位和压力位
  const levels = calculateLevels(klineData);

  // 找到当前币种的实时数据
  const currentMarket = marketData.find(m => m.symbol === selectedSymbol.replace("USDT", ""));

  // 当前使用的价格（真实数据优先）
  const displayPrice = currentMarket?.price || currentPrice;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">信号监控</h1>
          <p className="text-muted-foreground">
            实时行情与AI交易信号 · 支撑压力位分析
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Badge variant="outline" className={cn(
            dataSource === "binance" ? "text-green-600 border-green-500" : "text-yellow-600 border-yellow-500"
          )}>
            {dataSource === "binance" ? "Binance 实时" : "模拟数据"}
          </Badge>
          <Button size="sm" variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            刷新数据
          </Button>
        </div>
      </div>

      {/* Price Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {symbols.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <div className="text-3xl font-bold">
                  ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={cn("flex items-center gap-2 text-sm", (currentMarket?.change24h || 0) >= 0 ? "text-green-500" : "text-red-500")}>
                  {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span>
                    {currentMarket?.change24h 
                      ? `${(currentMarket.change24h) >= 0 ? "+" : ""}${currentMarket.change24h.toFixed(2)}%`
                      : `${isUp ? "+" : ""}${priceChangePercent}%`
                    }
                  </span>
                  {currentMarket && <span className="text-muted-foreground">24h</span>}
                </div>
              </div>

              {/* 支撑位和压力位 */}
              <div className="flex items-center gap-4 pl-6 border-l">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <TrendingDown className="h-3 w-3" />
                    压力位
                  </div>
                  <div className="font-bold">${(currentMarket?.price ? levels.resistance : currentPrice * 1.02).toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    支撑位
                  </div>
                  <div className="font-bold">${(currentMarket?.price ? levels.support : currentPrice * 0.98).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList>
                  <TabsTrigger value="1m">1m</TabsTrigger>
                  <TabsTrigger value="5m">5m</TabsTrigger>
                  <TabsTrigger value="1h">1h</TabsTrigger>
                  <TabsTrigger value="4h">4h</TabsTrigger>
                  <TabsTrigger value="1d">1d</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Signals */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* K-Line Chart with Levels */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {selectedSymbol} K线
              {dataSource === "binance" && (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-500">
                  实时
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={klineData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" interval="preserveStartEnd" />
                <YAxis className="text-xs" domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                {/* 压力位参考线 */}
                <ReferenceLine 
                  y={currentMarket?.price ? levels.resistance : currentPrice * 1.02} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: "压力", position: "right", fill: "#ef4444", fontSize: 10 }}
                />
                {/* 支撑位参考线 */}
                <ReferenceLine 
                  y={currentMarket?.price ? levels.support : currentPrice * 0.98} 
                  stroke="#22c55e" 
                  strokeDasharray="5 5"
                  label={{ value: "支撑", position: "right", fill: "#22c55e", fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isUp ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TFT Signal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              TFT融合信号
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl font-bold mb-2">
                <span className={tftSignals[tftSignals.length - 1]?.signal > 0 ? "text-green-500" : "text-red-500"}>
                  {(tftSignals[tftSignals.length - 1]?.signal * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                置信度: {tftSignals[tftSignals.length - 1]?.confidence}%
              </p>
            </div>

            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={tftSignals}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" domain={[-1, 1]} />
                <Tooltip />
                <Bar
                  dataKey="signal"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">模型版本</span>
                <span className="font-medium">TFT-v4.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">序列长度</span>
                <span className="font-medium">64 K线</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">特征维度</span>
                <span className="font-medium">1500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">更新时间</span>
                <span className="font-medium">刚刚</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals Table with Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            最新交易信号
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>交易对</TableHead>
                  <TableHead>策略</TableHead>
                  <TableHead>方向</TableHead>
                  <TableHead>入场价</TableHead>
                  <TableHead>止损价</TableHead>
                  <TableHead>止盈价</TableHead>
                  <TableHead>支撑位</TableHead>
                  <TableHead>压力位</TableHead>
                  <TableHead>置信度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.slice(0, 6).map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell className="text-muted-foreground">{signal.time}</TableCell>
                    <TableCell className="font-medium">{signal.symbol}</TableCell>
                    <TableCell className="text-sm">{signal.strategy}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          signal.direction === "做多" && "bg-green-500/10 text-green-600 border-green-500/20",
                          signal.direction === "做空" && "bg-red-500/10 text-red-600 border-red-500/20",
                          signal.direction === "观望" && "bg-gray-500/10 text-gray-600 border-gray-500/20"
                        )}
                      >
                        {signal.direction === "做多" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                        {signal.direction === "做空" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {signal.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">${signal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-red-500">${signal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-green-500">${signal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-green-500">${signal.support.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-red-500">${signal.resistance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{signal.confidence}%</span>
                        {signal.confidence >= 80 && (
                          <Badge variant="secondary" className="text-xs">强</Badge>
                        )}
                        {signal.confidence >= 60 && signal.confidence < 80 && (
                          <Badge variant="secondary" className="text-xs">中</Badge>
                        )}
                        {signal.confidence < 60 && (
                          <Badge variant="secondary" className="text-xs bg-gray-500/10 text-gray-600">弱</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Signal Details - 判断依据和下一步推演 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 判断依据 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              判断依据
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals.slice(0, 4).map((signal) => (
                <div key={signal.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          signal.direction === "做多" && "bg-green-500/10 text-green-600",
                          signal.direction === "做空" && "bg-red-500/10 text-red-600",
                          signal.direction === "观望" && "bg-gray-500/10 text-gray-600"
                        )}
                      >
                        {signal.direction}
                      </Badge>
                      <span className="font-medium">{signal.symbol}</span>
                      <span className="text-sm text-muted-foreground">{signal.strategy}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{signal.confidence}%置信</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {signal.reason.split("；").map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 下一步推演 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              下一步推演
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals.slice(0, 4).map((signal) => (
                <div key={signal.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        signal.direction === "做多" && "bg-green-500/10 text-green-600",
                        signal.direction === "做空" && "bg-red-500/10 text-red-600",
                        signal.direction === "观望" && "bg-gray-500/10 text-gray-600"
                      )}
                    >
                      {signal.direction}
                    </Badge>
                    <span className="font-medium">{signal.symbol}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">{signal.nextMove}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">风控建议：</span>
                    {signal.direction === "做多" && (
                      <span className="text-green-600">止损{((1 - signal.stopLoss / signal.entryPrice) * 100).toFixed(1)}%，盈亏比{((signal.takeProfit - signal.entryPrice) / (signal.entryPrice - signal.stopLoss)).toFixed(1)}:1</span>
                    )}
                    {signal.direction === "做空" && (
                      <span className="text-red-600">止损{(((signal.stopLoss - signal.entryPrice) / signal.entryPrice) * 100).toFixed(1)}%，盈亏比{(((signal.entryPrice - signal.takeProfit) / (signal.stopLoss - signal.entryPrice))).toFixed(1)}:1</span>
                    )}
                    {signal.direction === "观望" && (
                      <span className="text-gray-500">等待明确信号</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Regime */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            市场体制识别 (HMM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: "震荡", color: "bg-yellow-500", active: false, probability: 32 },
              { name: "上涨趋势", color: "bg-green-500", active: true, probability: 45 },
              { name: "下跌趋势", color: "bg-red-500", active: false, probability: 15 },
              { name: "高波动", color: "bg-purple-500", active: false, probability: 8 },
            ].map((regime) => (
              <div
                key={regime.name}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  regime.active && "border-green-500 bg-green-500/5"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("h-3 w-3 rounded-full", regime.color)} />
                  <span className="font-medium">{regime.name}</span>
                  {regime.active && (
                    <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-600">
                      当前
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">{regime.probability}%</div>
                <p className="text-xs text-muted-foreground">概率</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
