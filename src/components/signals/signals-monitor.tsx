'use client';

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
  ReferenceLine,
} from "recharts";

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];
const intervals = ["1m", "5m", "1h", "4h", "1d"];

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
  riskReward: number;
  reason: string[];
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

function calculateIndicators(klines: KLineData[]) {
  if (klines.length < 20) return null;
  
  const closes = klines.map(k => k.close);
  const highs = klines.map(k => k.high);
  const lows = klines.map(k => k.low);
  
  // MA
  const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const ma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
  
  // EMA
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  
  // RSI
  const rsi = calculateRSI(closes, 14);
  
  // MACD
  const macd = ema12 - ema26;
  const signalLine = calculateEMA([...closes.slice(0, -1), macd], 9);
  const macdHistogram = macd - signalLine;
  
  // Bollinger Bands
  const stdDev = Math.sqrt(closes.slice(-20).reduce((sum, val) => sum + Math.pow(val - ma20, 2), 0) / 20);
  const upperBand = ma20 + 2 * stdDev;
  const lowerBand = ma20 - 2 * stdDev;
  const bbWidth = ((upperBand - lowerBand) / ma20) * 100;
  
  // ATR
  const atr = calculateATR(klines, 14);
  
  // Recent volatility
  const recentChange = ((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100;
  
  // Volume analysis
  const avgVolume = klines.slice(-20).reduce((sum, k) => sum + k.volume, 0) / 20;
  const lastVolume = klines[klines.length - 1].volume;
  const volumeRatio = lastVolume / avgVolume;
  
  return {
    ma20, ma10, ema12, ema26, rsi, macd, macdHistogram, signalLine,
    upperBand, lowerBand, bbWidth, atr,
    recentChange, volumeRatio,
    currentPrice: closes[closes.length - 1],
    maxHigh: Math.max(...highs.slice(-20)),
    minLow: Math.min(...lows.slice(-20)),
  };
}

function calculateEMA(data: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = data[0];
  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateRSI(data: number[], period: number): number {
  let gains = 0, losses = 0;
  for (let i = data.length - period; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateATR(klines: KLineData[], period: number): number {
  const trueRanges = [];
  for (let i = 1; i < klines.length; i++) {
    const high = klines[i].high;
    const low = klines[i].low;
    const prevClose = klines[i - 1].close;
    trueRanges.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }
  return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
}

interface Indicators {
  currentPrice: number;
  recentChange: number;
  ma10: number;
  ma20: number;
  rsi: number;
  macd: number;
  signalLine: number;
  upperBand: number;
  lowerBand: number;
  bbWidth: number;
  atr: number;
  minLow: number;
  maxHigh: number;
}

function generateSignalFromIndicators(indicators: Indicators, symbol: string, _marketData: MarketData[]): Signal {
  const currentPrice = indicators.currentPrice;
  
  // Determine direction based on multiple indicators
  let bullishSignals = 0;
  let bearishSignals = 0;
  const strategies: string[] = [];
  
  // MA Trend
  if (indicators.ma10 > indicators.ma20) {
    bullishSignals += 2;
    strategies.push("MA多头排列");
  } else if (indicators.ma10 < indicators.ma20) {
    bearishSignals += 2;
    strategies.push("MA空头排列");
  }
  
  // RSI
  if (indicators.rsi < 30) {
    bullishSignals += 3;
    strategies.push("RSI超卖");
  } else if (indicators.rsi > 70) {
    bearishSignals += 3;
    strategies.push("RSI超买");
  }
  
  // MACD
  if (indicators.macdHistogram > 0) {
    bullishSignals += 2;
    strategies.push("MACD柱正值");
  } else {
    bearishSignals += 2;
    strategies.push("MACD柱负值");
  }
  
  // Bollinger Bands position
  const bbPos = (currentPrice - indicators.lowerBand) / (indicators.upperBand - indicators.lowerBand);
  if (bbPos < 0.2) {
    bullishSignals += 2;
    strategies.push("触及布林下轨");
  } else if (bbPos > 0.8) {
    bearishSignals += 2;
    strategies.push("触及布林上轨");
  }
  
  // Price vs MA
  if (currentPrice > indicators.ma20) {
    bullishSignals += 1;
  } else {
    bearishSignals += 1;
  }
  
  // Determine final direction and confidence
  const totalSignals = bullishSignals + bearishSignals;
  const bullishRatio = bullishSignals / totalSignals;
  
  let direction: "做多" | "做空" | "观望";
  let confidence: number;
  let signal: number;
  
  if (bullishRatio > 0.65) {
    direction = "做多";
    signal = bullishRatio;
    confidence = Math.round(bullishRatio * 100);
  } else if (bullishRatio < 0.35) {
    direction = "做空";
    signal = -bullishRatio;
    confidence = Math.round((1 - bullishRatio) * 100);
  } else {
    direction = "观望";
    signal = 0;
    confidence = 50;
  }
  
  // Calculate entry, stop loss, take profit
  const atr = indicators.atr;
  const stopLoss = direction === "做多" 
    ? currentPrice - atr * 2 
    : direction === "做空" 
      ? currentPrice + atr * 2 
      : currentPrice;
  
  const takeProfit = direction === "做多" 
    ? currentPrice + atr * 4 
    : direction === "做空" 
      ? currentPrice - atr * 4 
      : currentPrice;
  
  const riskReward = direction !== "观望" 
    ? (Math.abs(takeProfit - currentPrice) / Math.abs(stopLoss - currentPrice)).toFixed(2)
    : 0;
  
  // Support and resistance
  const support = indicators.minLow;
  const resistance = indicators.maxHigh;
  
  // Generate reasons based on actual indicators
  const reasons: string[] = [];
  
  if (indicators.rsi < 30) {
    reasons.push(`RSI(14)=${indicators.rsi.toFixed(1)}处于超卖区域，下跌动能减弱`);
  } else if (indicators.rsi > 70) {
    reasons.push(`RSI(14)=${indicators.rsi.toFixed(1)}处于超买区域，警惕回调风险`);
  }
  
  if (indicators.macd > indicators.signalLine) {
    reasons.push(`MACD(${indicators.macd.toFixed(2)})上穿信号线(${indicators.signalLine.toFixed(2)})，短期看涨`);
  } else {
    reasons.push(`MACD(${indicators.macd.toFixed(2)})下穿信号线(${indicators.signalLine.toFixed(2)})，短期看跌`);
  }
  
  if (currentPrice > indicators.ma20) {
    reasons.push(`价格(${currentPrice.toFixed(2)})站稳20日均线(${indicators.ma20.toFixed(2)})上方`);
  } else {
    reasons.push(`价格(${currentPrice.toFixed(2)})跌破20日均线(${indicators.ma20.toFixed(2)})`);
  }
  
  if (indicators.bbWidth < 3) {
    reasons.push(`布林带收口至${indicators.bbWidth.toFixed(1)}%，突破后将出现大幅波动`);
  }
  
  if (indicators.volumeRatio > 1.5) {
    reasons.push(`成交量放大至均量的${(indicators.volumeRatio * 100).toFixed(0)}%，确认趋势`);
  }
  
  // Next move recommendation
  let nextMove: string;
  if (direction === "做多") {
    nextMove = `等待回踩${currentPrice.toFixed(2)}确认支撑后入场，止损设${stopLoss.toFixed(2)}，止盈目标${takeProfit.toFixed(2)}，盈亏比${riskReward}:1`;
  } else if (direction === "做空") {
    nextMove = `等待反弹至${currentPrice.toFixed(2)}受压后入场，止损设${stopLoss.toFixed(2)}，止盈目标${takeProfit.toFixed(2)}，盈亏比${riskReward}:1`;
  } else {
    nextMove = "当前多空力量均衡，建议等待方向明确后再操作，控制仓位风险";
  }
  
  return {
    id: 1,
    symbol,
    strategy: strategies.length > 0 ? strategies.slice(0, 2).join("+") : "综合分析",
    signal,
    direction,
    confidence,
    time: new Date().toLocaleString("zh-CN"),
    entryPrice: currentPrice,
    stopLoss,
    takeProfit,
    support,
    resistance,
    riskReward: parseFloat(String(riskReward)),
    reason: reasons,
    nextMove,
  };
}

export default function SignalsMonitor() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState("1h");
  const [klineData, setKlineData] = useState<KLineData[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [regime, setRegime] = useState<{ name: string; color: string }>({ name: "震荡", color: "yellow" });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [klines, prices] = await Promise.all([
      fetchKlineData(selectedSymbol, selectedInterval),
      fetchMarketData(),
    ]);
    
    setKlineData(klines);
    setMarketData(prices);
    
    if (klines.length > 0) {
      const indicators = calculateIndicators(klines);
      if (indicators) {
        const newSignal = generateSignalFromIndicators(indicators, selectedSymbol, prices);
        setSignal(newSignal);
        
        // Determine regime
        const volatility = (indicators.upperBand - indicators.lowerBand) / indicators.currentPrice * 100;
        if (volatility > 5) {
          setRegime({ name: "高波动", color: "red" });
        } else if (indicators.recentChange > 2) {
          setRegime({ name: "上涨趋势", color: "green" });
        } else if (indicators.recentChange < -2) {
          setRegime({ name: "下跌趋势", color: "red" });
        } else {
          setRegime({ name: "震荡", color: "yellow" });
        }
      }
    }
    
    setLastUpdate(new Date().toLocaleTimeString("zh-CN"));
    setIsLoading(false);
  }, [selectedSymbol, selectedInterval]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const currentMarket = marketData.find(m => m.symbol === selectedSymbol);
  const changeColor = currentMarket && currentMarket.change24h >= 0 ? "text-emerald-400" : "text-red-400";

  const regimeColors: Record<string, string> = {
    green: "bg-emerald-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Brain className="text-emerald-400" />
            信号监控中心
            {currentMarket && (
              <span className={`text-lg ml-2 ${changeColor}`}>
                ${currentMarket.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            最后更新: {lastUpdate} | 数据来源: Binance
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          刷新数据
        </button>
      </div>

      {/* Symbol Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {symbols.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSymbol === sym
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {sym.replace("USDT", "/USDT")}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {intervals.map((int) => (
            <button
              key={int}
              onClick={() => setSelectedInterval(int)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedInterval === int
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {int}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2 space-y-4">
          {/* K线图 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-blue-400 w-5 h-5" />
              {selectedSymbol.replace("USDT", "/USDT")} K线 ({selectedInterval})
              {currentMarket && (
                <span className={`ml-2 text-sm ${changeColor}`}>
                  {currentMarket.change24h >= 0 ? "+" : ""}{currentMarket.change24h.toFixed(2)}%
                </span>
              )}
            </h3>
            {signal && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">支撑位</div>
                  <div className="text-emerald-400 font-bold text-lg">
                    ${signal.support.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">压力位</div>
                  <div className="text-red-400 font-bold text-lg">
                    ${signal.resistance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">ATR(14)</div>
                  <div className="text-blue-400 font-bold text-lg">
                    ${(signal.takeProfit - signal.stopLoss).toFixed(2)}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">市场体制</div>
                  <div className={`${regimeColors[regime.color]} text-white font-bold text-lg px-2 py-0.5 rounded text-center`}>
                    {regime.name}
                  </div>
                </div>
              </div>
            )}
            <div className="h-72">
              {klineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={klineData}>
                    <defs>
                      <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentMarket && currentMarket.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={currentMarket && currentMarket.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    {signal && (
                      <>
                        <ReferenceLine y={signal.support} stroke="#10b981" strokeDasharray="3 3" label={{ value: "支撑", fill: "#10b981", fontSize: 10 }} />
                        <ReferenceLine y={signal.resistance} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "压力", fill: "#ef4444", fontSize: 10 }} />
                      </>
                    )}
                    <Area type="monotone" dataKey="close" stroke={currentMarket && currentMarket.change24h >= 0 ? "#10b981" : "#ef4444"} fill="url(#colorClose)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">加载中...</div>
              )}
            </div>
          </div>

          {/* 最新信号 */}
          {signal && (
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {signal.direction === "做多" ? (
                  <TrendingUp className="text-emerald-400 w-5 h-5" />
                ) : signal.direction === "做空" ? (
                  <TrendingDown className="text-red-400 w-5 h-5" />
                ) : (
                  <Activity className="text-yellow-400 w-5 h-5" />
                )}
                信号详情
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">方向</div>
                  <div className={`font-bold text-xl ${
                    signal.direction === "做多" ? "text-emerald-400" : signal.direction === "做空" ? "text-red-400" : "text-yellow-400"
                  }`}>
                    {signal.direction}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">置信度</div>
                  <div className="font-bold text-xl text-blue-400">{signal.confidence}%</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">入场价</div>
                  <div className="font-bold text-xl">${signal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">盈亏比</div>
                  <div className="font-bold text-xl text-purple-400">{signal.riskReward}:1</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">止损价</div>
                  <div className="font-bold text-lg text-red-400">${signal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">止盈价</div>
                  <div className="font-bold text-lg text-emerald-400">${signal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">策略</div>
                  <div className="font-bold text-sm">{signal.strategy}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">信号时间</div>
                  <div className="font-bold text-xs">{signal.time}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* 判断依据 */}
          {signal && (
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400 w-5 h-5" />
                判断依据
              </h3>
              <div className="space-y-2">
                {signal.reason.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-slate-300">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 下一步推演 */}
          {signal && (
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="text-purple-400 w-5 h-5" />
                操作建议
              </h3>
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                <p className="text-slate-200 leading-relaxed">{signal.nextMove}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-700/50 rounded p-2">
                  <div className="text-slate-400 text-xs">风险等级</div>
                  <div className={signal.confidence > 70 ? "text-emerald-400" : signal.confidence > 50 ? "text-yellow-400" : "text-red-400"}>
                    {signal.confidence > 70 ? "低" : signal.confidence > 50 ? "中" : "高"}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded p-2">
                  <div className="text-slate-400 text-xs">建议仓位</div>
                  <div className="text-blue-400">
                    {signal.confidence > 70 ? "10-20%" : signal.confidence > 50 ? "5-10%" : "1-5%"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 市场状态 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="text-blue-400 w-5 h-5" />
              市场状态
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">HMM体制</span>
                <span className={`px-2 py-1 rounded text-sm ${regimeColors[regime.color]} text-white`}>
                  {regime.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">信号强度</span>
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${signal && signal.signal > 0 ? "bg-emerald-500" : signal && signal.signal < 0 ? "bg-red-500" : "bg-yellow-500"}`}
                    style={{ width: `${signal ? Math.abs(signal.signal) * 100 : 50}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">TFT置信度</span>
                <span className="text-blue-400">{signal ? signal.confidence : 0}%</span>
              </div>
            </div>
          </div>

          {/* 币种概览 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">币种概览</h3>
            <div className="space-y-2">
              {marketData.slice(0, 5).map((m) => (
                <div key={m.symbol} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                  <span className="font-medium">{m.symbol.replace("USDT", "")}</span>
                  <div className="text-right">
                    <div className="font-medium">${m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`text-xs ${m.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {m.change24h >= 0 ? "+" : ""}{m.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
