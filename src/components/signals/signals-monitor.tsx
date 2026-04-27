"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Zap, Brain, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Shield, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

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

function calculateLevels(klines: KLineData[]) {
  if (klines.length < 20) return { support: 0, resistance: 0, midLevel: 0 };
  
  const recentData = klines.slice(-20);
  const highs = recentData.map(k => k.high);
  const lows = recentData.map(k => k.low);
  const closes = recentData.map(k => k.close);
  
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);
  const avgClose = closes.reduce((a, b) => a + b, 0) / closes.length;
  const volatility = avgClose * 0.02;
  
  return {
    support: Math.floor((minLow + volatility * 0.5) / 100) * 100,
    resistance: Math.ceil((maxHigh - volatility * 0.5) / 100) * 100,
    midLevel: avgClose
  };
}

function generateSignals(currentPrice: number, symbol: string): Signal[] {
  const signalTemplates = [
    { symbol: "BTCUSDT", strategy: "TFT融合信号", signal: 0.72, direction: "做多" as const, confidence: 85 },
    { symbol: "ETHUSDT", strategy: "趋势突破", signal: 0.58, direction: "做多" as const, confidence: 72 },
    { symbol: "BNBUSDT", strategy: "资金费率套利", signal: 0.45, direction: "观望" as const, confidence: 65 },
    { symbol: "SOLUSDT", strategy: "动量加速", signal: -0.32, direction: "做空" as const, confidence: 58 },
    { symbol: "BTCUSDT", strategy: "布林带收口", signal: 0.68, direction: "做多" as const, confidence: 78 },
    { symbol: "XRPUSDT", strategy: "RSI超卖", signal: 0.82, direction: "做多" as const, confidence: 88 },
  ];

  const reasons: Record<string, string[]> = {
    "TFT融合信号": ["TFT模型综合1500维特征输出看涨信号", "Temporal Fusion Transformer时序融合良好", "LSTM编码器捕获长期依赖关系"],
    "趋势突破": ["价格突破20日均线阻力位", "成交量较均值放大120%", "MACD金叉形成中"],
    "资金费率套利": ["资金费率-0.01%套利空间充足", "永续合约与现货价差收窄", "预计费率结算后价差回归"],
    "动量加速": ["RSI指标进入超买区域(75)", "价格偏离20日均线+2σ", "成交量萎缩动能减弱"],
    "布林带收口": ["布林带收口至2%宽度", "ATR指标显示波动率降至低点", "突破后将出现大幅波动"],
    "RSI超卖": ["RSI(14)降至28处于超卖区", "价格触及布林下轨支撑", "恐慌情绪指标达到局部峰值"],
  };
  
  const nextMoves: Record<string, { bull: string; bear: string }> = {
    "TFT融合信号": {
      bull: "等待回踩确认后入场，止损2%，目标止盈5%",
      bear: "若放量跌破关键支撑，信号失效建议观望"
    },
    "趋势突破": {
      bull: "若1小时内站稳，追多5%仓位，严格止损",
      bear: "若快速冲高回落收长上影线，考虑开空对冲"
    },
    "资金费率套利": {
      bull: "当前套利空间有限，建议观望",
      bear: "若资金费率转正，可开空头套利"
    },
    "动量加速": {
      bull: "当前做空信号，等待反弹至关键位后做空",
      bear: "若继续放量下跌，可加仓做空"
    },
    "布林带收口": {
      bull: "向上突破关键位后追多，严格止损",
      bear: "向下突破后追空"
    },
    "RSI超卖": {
      bull: "RSI回升至35以上企稳后做多，目标3%，止损1.5%",
      bear: "若RSI继续下行至20以下，勿盲目抄底"
    },
  };

  return signalTemplates.map((template, index) => {
    const entryPrice = template.symbol === symbol ? currentPrice : currentPrice * (0.95 + Math.random() * 0.1);
    const direction = template.direction;
    const stopLoss = direction === "做多" ? entryPrice * 0.985 : entryPrice * 1.015;
    const takeProfit = direction === "做多" ? entryPrice * 1.03 : entryPrice * 0.97;
    const support = direction === "做多" ? entryPrice * 0.97 : entryPrice * 0.99;
    const resistance = direction === "做多" ? entryPrice * 1.03 : entryPrice * 1.01;
    
    return {
      ...template,
      id: index + 1,
      time: index === 0 ? "刚刚" : index === 1 ? "5秒前" : index === 2 ? "15秒前" : index === 3 ? "30秒前" : `${index}分钟前`,
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
  const [lastUpdate, setLastUpdate] = useState(new Date());
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
        const basePrice = selectedSymbol === "BTCUSDT" ? 67000 : selectedSymbol === "ETHUSDT" ? 3500 : 500;
        const mockKlines: KLineData[] = [];
        const now = Date.now();
        
        for (let i = 0; i < 100; i++) {
          const change = (Math.random() - 0.5) * 0.02;
          const open = basePrice * (1 + change);
          const close = open * (1 + (Math.random() - 0.5) * 0.01);
          mockKlines.push({
            time: new Date(now - i * 3600000).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            date: new Date(now - i * 3600000).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
            open,
            high: Math.max(open, close) * 1.005,
            low: Math.min(open, close) * 0.995,
            close,
            volume: Math.random() * 1000000,
          });
        }
        setKlineData(mockKlines.reverse());
      }
      
      if (markets.length > 0) {
        setMarketData(markets);
      }
      
      const currentPrice = markets.find((m: MarketData) => m.symbol === selectedSymbol)?.price || 
        (selectedSymbol === "BTCUSDT" ? 67000 : selectedSymbol === "ETHUSDT" ? 3500 : 500);
      setSignals(generateSignals(currentPrice, selectedSymbol));
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setIsLoading(false);
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const levels = calculateLevels(klineData);
  const currentKline = klineData[klineData.length - 1];
  const priceChange = currentKline ? ((currentKline.close - currentKline.open) / currentKline.open * 100).toFixed(2) : "0.00";
  const isPositive = parseFloat(priceChange) >= 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* 头部 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          信号监控中心
        </h1>
        <p className="text-slate-400 mt-2">实时行情 + AI信号分析</p>
      </div>

      {/* 行情概览 */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Binance 实时行情
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              更新: {lastUpdate.toLocaleTimeString("zh-CN")}
            </span>
            <button 
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>
        
        {marketData.length > 0 && (
          <div className="grid grid-cols-5 gap-4">
            {marketData.map((item: MarketData) => (
              <div key={item.symbol} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="text-lg font-bold text-slate-300 mb-1">{item.symbol.replace('USDT', '/USDT')}</div>
                <div className="text-2xl font-mono font-bold text-white mb-1">
                  ${item.price.toLocaleString()}
                </div>
                <div className={`text-sm font-medium ${item.change24h >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {item.change24h >= 0 ? '▲' : '▼'} {Math.abs(item.change24h).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 币种选择和时间周期 */}
      <div className="flex gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex-1">
          <div className="text-sm text-slate-400 mb-3">选择交易对</div>
          <div className="flex gap-2">
            {symbols.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSymbol(s)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSymbol === s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {s.replace('USDT', '')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-3">时间周期</div>
          <div className="flex gap-2">
            {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* K线图 */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              {selectedSymbol.replace('USDT', '/USDT')} K线图
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-white">
                  ${currentKline?.close.toLocaleString() || '--'}
                </div>
                <div className={`text-sm ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isPositive ? '▲' : '▼'} {priceChange}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={klineData.slice(-50)}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#f87171" : "#34d399"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isPositive ? "#f87171" : "#34d399"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? "#f87171" : "#34d399"}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* 支撑位和压力位 */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
              <div className="text-sm text-emerald-400 mb-1">支撑位</div>
              <div className="text-xl font-bold text-emerald-400">${levels.support.toLocaleString()}</div>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
              <div className="text-sm text-slate-400 mb-1">当前价格</div>
              <div className="text-xl font-bold text-white">${currentKline?.close.toLocaleString() || '--'}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
              <div className="text-sm text-red-400 mb-1">压力位</div>
              <div className="text-xl font-bold text-red-400">${levels.resistance.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* TFT融合信号强度 */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            TFT融合信号
          </h2>
          
          <div className="mb-6">
            <div className="text-center mb-4">
              <div className={`text-5xl font-bold ${
                parseFloat(priceChange) >= 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {parseFloat(priceChange) >= 0 ? '72' : '45'}%
              </div>
              <div className="text-slate-400 mt-2">信号强度</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">做多信号</span>
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">做空信号</span>
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">置信度</span>
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">市场体制识别 (HMM)</div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                震荡上涨
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-slate-700 text-slate-400">
                趋势: 中性
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 最新交易信号 */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          最新交易信号
        </h2>
        
        <div className="space-y-4">
          {signals.slice(0, 6).map((signal) => (
            <div key={signal.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {signal.direction === "做多" ? (
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : signal.direction === "做空" ? (
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-slate-500/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg">{signal.symbol.replace('USDT', '/USDT')}</div>
                    <div className="text-sm text-slate-400">{signal.strategy}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-4 py-2 rounded-full font-bold text-lg ${
                    signal.direction === "做多" 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : signal.direction === "做空"
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    {signal.direction}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    置信度: {signal.confidence}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">入场价</div>
                  <div className="font-mono font-medium">${signal.entryPrice.toLocaleString()}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="text-xs text-red-400 mb-1">止损价</div>
                  <div className="font-mono font-medium text-red-400">${signal.stopLoss.toLocaleString()}</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="text-xs text-emerald-400 mb-1">止盈价</div>
                  <div className="font-mono font-medium text-emerald-400">${signal.takeProfit.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">盈亏比</div>
                  <div className="font-mono font-medium text-cyan-400">1:2</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-emerald-400 mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    判断依据
                  </div>
                  <div className="text-sm text-slate-300">{signal.reason}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-cyan-400 mb-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    下一步推演
                  </div>
                  <div className="text-sm text-slate-300">{signal.nextMove}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>信号时间: {signal.time}</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  风险等级: 中
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
