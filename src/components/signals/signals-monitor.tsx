'use client';

import { useState, useEffect, useCallback } from "react";
import { Activity, Zap, Brain, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Shield, ArrowUpRight, ArrowDownRight, Clock, Timer, Calendar, Target } from "lucide-react";
import OKXKlineChart from "./okx-kline-chart";

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];
const intervals = ["1m", "5m", "15m", "1h", "4h", "1d"];

// 价格格式化函数 - 保持API原始精度
function formatPrice(price: number): string {
  // 使用toFixed保留最多4位小数，去掉尾部多余的0
  const formatted = price.toFixed(4);
  return parseFloat(formatted).toString();
}

interface KLineData {
  time: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma7: number;
  ma25: number;
  ma99: number;
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
  // 新增：短线、中线、长线
  shortTerm: {
    action: string;
    entry: number;
    stop: number;
    target: number;
    timeframe: string;
    riskReward?: number;
  };
  mediumTerm: {
    action: string;
    entry: number;
    stop: number;
    target: number;
    timeframe: string;
    riskReward?: number;
  };
  longTerm: {
    action: string;
    entry: number;
    stop: number;
    target: number;
    timeframe: string;
    riskReward?: number;
  };
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
        time: k.time,
        date: new Date(k.time).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.volume,
        ma7: k.close,
        ma25: k.close,
        ma99: k.close,
      }));
    }
  } catch {
    console.log("Using mock kline data");
  }
  return [];
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

function calculateMACD(data: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([...data.slice(0, -1), macd], 9);
  return { macd, signal, histogram: macd - signal };
}

function calculateStochastic(klines: KLineData[], period: number = 14): { k: number; d: number } {
  const recentKlines = klines.slice(-period);
  const highestHigh = Math.max(...recentKlines.map(k => k.high));
  const lowestLow = Math.min(...recentKlines.map(k => k.low));
  const currentClose = klines[klines.length - 1].close;
  
  const k = lowestLow === highestHigh ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  const d = calculateEMA([k], 3);
  
  return { k, d };
}

function calculateVWAP(klines: KLineData[]): number {
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  for (const k of klines.slice(-24)) {
    const typicalPrice = (k.high + k.low + k.close) / 3;
    cumulativeTPV += typicalPrice * k.volume;
    cumulativeVolume += k.volume;
  }
  return cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : klines[klines.length - 1].close;
}

interface Indicators {
  currentPrice: number;
  recentChange: number;
  change5m: number;
  change1h: number;
  change4h: number;
  change1d: number;
  ma5: number;
  ma10: number;
  ma20: number;
  ma50: number;
  ma200: number;
  ema12: number;
  ema26: number;
  rsi: number;
  rsi5: number;
  rsi14: number;
  macd: { macd: number; signal: number; histogram: number };
  stoch: { k: number; d: number };
  vwap: number;
  upperBand: number;
  lowerBand: number;
  middleBand: number;
  bbWidth: number;
  atr: number;
  atr5: number;
  atr14: number;
  minLow: number;
  maxHigh: number;
  volumeRatio: number;
  avgVolume: number;
  obv: number;
  adx: number;
}

function generateSignalFromIndicators(klines: KLineData[], symbol: string, _marketData: MarketData[]): Signal {
  if (klines.length < 50) {
    return createDefaultSignal(symbol);
  }
  
  const closes = klines.map(k => k.close);
  const highs = klines.map(k => k.high);
  const lows = klines.map(k => k.low);
  const volumes = klines.map(k => k.volume);
  
  const currentPrice = closes[closes.length - 1];
  const currentHigh = highs[highs.length - 1];
  const currentLow = lows[lows.length - 1];
  
  // 短期指标
  const ma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const ma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const ma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
  const ma200 = closes.length >= 200 ? closes.slice(-200).reduce((a, b) => a + b, 0) / 200 : currentPrice;
  
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const rsi5 = calculateRSI(closes, 5);
  const rsi14 = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const stoch = calculateStochastic(klines, 14);
  const vwap = calculateVWAP(klines);
  const atr14 = calculateATR(klines, 14);
  const atr5 = calculateATR(klines, 5);
  
  // 布林带
  const stdDev = Math.sqrt(closes.slice(-20).reduce((sum, val) => sum + Math.pow(val - ma20, 2), 0) / 20);
  const upperBand = ma20 + 2 * stdDev;
  const lowerBand = ma20 - 2 * stdDev;
  const middleBand = ma20;
  const bbWidth = ((upperBand - lowerBand) / ma20) * 100;
  
  // 成交量分析
  const avgVolume = klines.slice(-20).reduce((sum, k) => sum + k.volume, 0) / 20;
  const lastVolume = klines[klines.length - 1].volume;
  const volumeRatio = lastVolume / avgVolume;
  
  // OBV
  let obv = 0;
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv += volumes[i];
    else obv -= volumes[i];
  }
  
  // 价格变化
  const change5m = closes.length >= 5 ? ((currentPrice - closes[closes.length - 5]) / closes[closes.length - 5]) * 100 : 0;
  const change1h = closes.length >= 60 ? ((currentPrice - closes[closes.length - 60]) / closes[closes.length - 60]) * 100 : 0;
  const change4h = closes.length >= 240 ? ((currentPrice - closes[closes.length - 240]) / closes[closes.length - 240]) * 100 : 0;
  const change1d = closes.length >= 1440 ? ((currentPrice - closes[closes.length - 1440]) / closes[closes.length - 1440]) * 100 : 0;
  
  // ADX简化计算
  const adx = Math.abs(macd.histogram) / (atr14 / currentPrice * 100) * 10;
  
  // 综合评分
  let bullishScore = 0;
  let bearishScore = 0;
  const reasons: string[] = [];
  
  // 1. 均线系统分析
  if (ma5 > ma10 && ma10 > ma20) {
    bullishScore += 2;
    reasons.push(`短期均线多头排列：MA5(${ma5.toFixed(2)})>MA10(${ma10.toFixed(2)})>MA20(${ma20.toFixed(2)})`);
  } else if (ma5 < ma10 && ma10 < ma20) {
    bearishScore += 2;
    reasons.push(`短期均线空头排列：MA5(${ma5.toFixed(2)})<MA10(${ma10.toFixed(2)})<MA20(${ma20.toFixed(2)})`);
  }
  
  // 2. 长期趋势
  if (currentPrice > ma200) {
    bullishScore += 3;
    reasons.push(`长期趋势看涨：价格(${currentPrice.toFixed(2)})站稳200日均线(${ma200.toFixed(2)})上方`);
  } else {
    bearishScore += 3;
    reasons.push(`长期趋势看跌：价格(${currentPrice.toFixed(2)})位于200日均线(${ma200.toFixed(2)})下方`);
  }
  
  // 3. RSI分析
  if (rsi14 < 30) {
    bullishScore += 3;
    reasons.push(`RSI(14)=${rsi14.toFixed(1)}严重超卖，反弹概率增加`);
  } else if (rsi14 > 70) {
    bearishScore += 3;
    reasons.push(`RSI(14)=${rsi14.toFixed(1)}严重超买，回调风险较大`);
  } else if (rsi14 < 45) {
    bullishScore += 1;
    reasons.push(`RSI(14)=${rsi14.toFixed(1)}处于偏低区域，空头力量减弱`);
  } else if (rsi14 > 55) {
    bearishScore += 1;
    reasons.push(`RSI(14)=${rsi14.toFixed(1)}处于偏高区域，多头力量减弱`);
  }
  
  // 4. MACD分析
  if (macd.histogram > 0 && macd.macd > macd.signal) {
    bullishScore += 2;
    reasons.push(`MACD多头信号：快线(${macd.macd.toFixed(2)})上穿慢线(${macd.signal.toFixed(2)})，动能增强`);
  } else if (macd.histogram < 0 && macd.macd < macd.signal) {
    bearishScore += 2;
    reasons.push(`MACD空头信号：快线(${macd.macd.toFixed(2)})下穿慢线(${macd.signal.toFixed(2)})，动能减弱`);
  }
  
  // 5. 随机指标
  if (stoch.k < 20 && stoch.d < 20) {
    bullishScore += 2;
    reasons.push(`随机指标超卖：K=${stoch.k.toFixed(1)}, D=${stoch.d.toFixed(1)}`);
  } else if (stoch.k > 80 && stoch.d > 80) {
    bearishScore += 2;
    reasons.push(`随机指标超买：K=${stoch.k.toFixed(1)}, D=${stoch.d.toFixed(1)}`);
  }
  
  // 6. 布林带位置
  const bbPosition = (currentPrice - lowerBand) / (upperBand - lowerBand);
  if (bbPosition < 0.15) {
    bullishScore += 2;
    reasons.push(`价格触及布林下轨(${lowerBand.toFixed(2)})，存在反弹机会`);
  } else if (bbPosition > 0.85) {
    bearishScore += 2;
    reasons.push(`价格触及布林上轨(${upperBand.toFixed(2)})，警惕回调风险`);
  }
  
  // 7. VWAP分析
  if (currentPrice > vwap) {
    bullishScore += 1;
    reasons.push(`价格(${currentPrice.toFixed(2)})位于VWAP(${vwap.toFixed(2)})上方，市场偏强`);
  } else {
    bearishScore += 1;
    reasons.push(`价格(${currentPrice.toFixed(2)})位于VWAP(${vwap.toFixed(2)})下方，市场偏弱`);
  }
  
  // 8. 成交量确认
  if (volumeRatio > 2) {
    reasons.push(`成交量异常放大(${volumeRatio.toFixed(1)}倍)，需确认方向有效性`);
  } else if (volumeRatio > 1.5) {
    bullishScore += 1;
    reasons.push(`成交量放量(${volumeRatio.toFixed(1)}倍)，支持当前趋势`);
  }
  
  // 9. 波动率分析
  if (bbWidth < 2.5) {
    reasons.push(`布林带极度收口(${bbWidth.toFixed(1)}%)，即将选择方向，突破行情可期`);
  } else if (bbWidth > 6) {
    reasons.push(`布林带开口扩大(${bbWidth.toFixed(1)}%)，波动剧烈，注意风险`);
  }
  
  // 10. 支撑压力位分析
  const support = lowerBand;
  const resistance = upperBand;
  const midSupport = ma20;
  const midResistance = Math.max(...highs.slice(-50));
  
  if (currentPrice - support < atr14) {
    reasons.push(`接近布林下轨支撑(${support.toFixed(2)})，关注企稳信号`);
  }
  if (resistance - currentPrice < atr14) {
    reasons.push(`接近布林上轨压力(${resistance.toFixed(2)})，关注突破动能`);
  }
  
  // 11. 动能分析
  if (change1h > 1) {
    reasons.push(`1小时上涨${change1h.toFixed(2)}%，短期动能强劲`);
  } else if (change1h < -1) {
    reasons.push(`1小时下跌${change1h.toFixed(2)}%，短期动能较弱`);
  }
  
  // 12. ADX趋势强度
  if (adx > 25) {
    reasons.push(`ADX=${adx.toFixed(1)}>25，趋势明显`);
  }
  
  // 确定方向
  const totalScore = bullishScore + bearishScore;
  const bullishRatio = totalScore > 0 ? bullishScore / totalScore : 0.5;
  
  let direction: "做多" | "做空" | "观望";
  let confidence: number;
  let signal: number;
  
  if (bullishRatio > 0.6) {
    direction = "做多";
    signal = bullishRatio;
    confidence = Math.round(bullishRatio * 100);
  } else if (bullishRatio < 0.4) {
    direction = "做空";
    signal = -bullishRatio;
    confidence = Math.round((1 - bullishRatio) * 100);
  } else {
    direction = "观望";
    signal = 0;
    confidence = 50;
  }
  
  // 止损止盈计算
  const atrMultiplier = direction === "做多" ? 1.5 : 1.5;
  const stopLoss = direction === "做多" 
    ? currentPrice - atr14 * atrMultiplier
    : direction === "做空" 
      ? currentPrice + atr14 * atrMultiplier
      : currentPrice;
  
  const targetMultiplier = direction === "做多" ? 2.5 : 2.5;
  const takeProfit = direction === "做多" 
    ? currentPrice + atr14 * targetMultiplier
    : direction === "做空" 
      ? currentPrice - atr14 * targetMultiplier
      : currentPrice;
  
  const riskReward = direction !== "观望" 
    ? Math.abs(takeProfit - currentPrice) / Math.abs(stopLoss - currentPrice)
    : 0;
  
  // 短线、中线、长线建议
  const shortTerm = {
    action: rsi5 < 30 ? "超跌反弹做多" : rsi5 > 70 ? "超涨回落做空" : "观望",
    entry: rsi5 < 30 ? currentPrice * 0.998 : rsi5 > 70 ? currentPrice * 1.002 : currentPrice,
    stop: rsi5 < 30 ? currentPrice - atr5 * 1.5 : rsi5 > 70 ? currentPrice + atr5 * 1.5 : currentPrice,
    target: rsi5 < 30 ? currentPrice + atr5 * 3 : rsi5 > 70 ? currentPrice - atr5 * 3 : currentPrice,
    timeframe: "5-30分钟"
  };
  
  const mediumTerm = {
    action: direction === "做多" ? "顺势做多" : direction === "做空" ? "顺势做空" : "观望",
    entry: currentPrice,
    stop: stopLoss,
    target: takeProfit,
    timeframe: "1-4小时"
  };
  
  const longTerm = {
    action: currentPrice > ma50 ? "回调支撑做多" : "反弹压力做空",
    entry: currentPrice > ma50 ? ma50 * 1.005 : ma50 * 0.995,
    stop: currentPrice > ma50 ? ma50 * 0.95 : ma50 * 1.05,
    target: currentPrice > ma50 ? currentPrice * 1.1 : currentPrice * 0.9,
    timeframe: "1-7天"
  };
  
  // 操作建议
  let nextMove = "";
  if (direction === "做多") {
    nextMove = `当前综合看涨信号，置信度${confidence}%。建议分批建仓，回调至${support.toFixed(2)}附近企稳入场，止损${stopLoss.toFixed(2)}，第一目标${takeProfit.toFixed(2)}，盈亏比${riskReward.toFixed(2)}:1。注意控制仓位在10-20%以内。`;
  } else if (direction === "做空") {
    nextMove = `当前综合看空信号，置信度${confidence}%。建议反弹至${resistance.toFixed(2)}附近受压入场做空，止损${stopLoss.toFixed(2)}，第一目标${takeProfit.toFixed(2)}，盈亏比${riskReward.toFixed(2)}:1。注意控制仓位在10-20%以内。`;
  } else {
    nextMove = `多空力量接近均衡，建议观望等待。关注布林带收口后的方向选择，避免逆势操作。`;
  }
  
  return {
    id: 1,
    symbol,
    strategy: "TFT综合分析",
    signal,
    direction,
    confidence,
    time: new Date().toLocaleString("zh-CN"),
    entryPrice: currentPrice,
    stopLoss,
    takeProfit,
    support,
    resistance,
    riskReward,
    reason: reasons,
    nextMove,
    shortTerm,
    mediumTerm,
    longTerm,
  };
}

function createDefaultSignal(symbol: string): Signal {
  return {
    id: 1,
    symbol,
    strategy: "等待数据",
    signal: 0,
    direction: "观望",
    confidence: 0,
    time: new Date().toLocaleString("zh-CN"),
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    support: 0,
    resistance: 0,
    riskReward: 0,
    reason: ["数据加载中..."],
    nextMove: "正在分析市场数据，请稍候...",
    shortTerm: { action: "分析中", entry: 0, stop: 0, target: 0, timeframe: "5-30分钟" },
    mediumTerm: { action: "分析中", entry: 0, stop: 0, target: 0, timeframe: "1-4小时" },
    longTerm: { action: "分析中", entry: 0, stop: 0, target: 0, timeframe: "1-7天" },
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
      const newSignal = generateSignalFromIndicators(klines, selectedSymbol, prices);
      setSignal(newSignal);
      
      // 确定市场体制
      const closes = klines.map(k => k.close);
      const recentChange = ((closes[closes.length - 1] - closes[closes.length - 60]) / closes[closes.length - 60]) * 100;
      const highs = klines.map(k => k.high);
      const lows = klines.map(k => k.low);
      const volatility = (Math.max(...highs.slice(-20)) - Math.min(...lows.slice(-20))) / closes[closes.length - 1] * 100;
      
      if (volatility > 5 || Math.abs(recentChange) > 3) {
        setRegime({ name: "高波动", color: "red" });
      } else if (recentChange > 1) {
        setRegime({ name: "上涨趋势", color: "green" });
      } else if (recentChange < -1) {
        setRegime({ name: "下跌趋势", color: "red" });
      } else {
        setRegime({ name: "震荡", color: "yellow" });
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
            最后更新: {lastUpdate} | 数据来源: Binance 实时
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

      {/* Symbol & Interval Selection */}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-4">
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">支撑位</div>
                  <div className="text-emerald-400 font-bold">
                    ${signal.support.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">压力位</div>
                  <div className="text-red-400 font-bold">
                    ${signal.resistance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">ATR(14)</div>
                  <div className="text-blue-400 font-bold">
                    ${(signal.takeProfit - signal.stopLoss).toFixed(2)}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">市场体制</div>
                  <div className={`${regimeColors[regime.color]} text-white font-bold text-sm px-2 py-0.5 rounded text-center`}>
                    {regime.name}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">止损价</div>
                  <div className="text-red-400 font-bold text-sm">
                    ${signal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">止盈价</div>
                  <div className="text-emerald-400 font-bold text-sm">
                    ${signal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
            {/* OKX风格K线图 */}
            <OKXKlineChart data={klineData} />
          </div>

          {/* 信号详情 */}
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
                综合信号分析
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-xs mb-1">交易方向</div>
                  <div className={`font-bold text-2xl ${
                    signal.direction === "做多" ? "text-emerald-400" : signal.direction === "做空" ? "text-red-400" : "text-yellow-400"
                  }`}>
                    {signal.direction}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-xs mb-1">置信度</div>
                  <div className="font-bold text-2xl text-blue-400">{signal.confidence}%</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-xs mb-1">入场价</div>
                  <div className="font-bold text-xl">${signal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-xs mb-1">盈亏比</div>
                  <div className="font-bold text-2xl text-purple-400">{signal.riskReward.toFixed(2)}:1</div>
                </div>
              </div>
            </div>
          )}

          {/* 短线、中线、长线操作建议 */}
          {signal && (
            <div className="bg-slate-800 rounded-xl p-3 md:p-4">
              <h3 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="text-purple-400 w-4 h-4 md:w-5 md:h-5" />
                多周期操作建议
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {/* 短线 */}
                <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border border-orange-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="text-orange-400 w-4 h-4" />
                    <span className="font-bold text-orange-400 text-sm md:text-base">日内短线</span>
                    <span className="text-xs text-slate-400 ml-auto">{signal.shortTerm.timeframe}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">操作:</span>
                      <span className={`font-bold ${
                        signal.shortTerm.action.includes("做多") ? "text-emerald-400" : 
                        signal.shortTerm.action.includes("做空") ? "text-red-400" : "text-yellow-400"
                      }`}>
                        {signal.shortTerm.action}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">盈亏比:</span>
                      <span className="text-purple-400">{signal.shortTerm.riskReward}:1</span>
                    </div>
                    <div className="flex justify-between col-span-2 mt-1">
                      <span className="text-slate-400">建议入场:</span>
                      <span className="text-white font-mono text-xs">${formatPrice(signal.shortTerm.entry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">止损:</span>
                      <span className="text-red-400 font-mono text-xs">${formatPrice(signal.shortTerm.stop)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">目标:</span>
                      <span className="text-emerald-400 font-mono text-xs">${formatPrice(signal.shortTerm.target)}</span>
                    </div>
                  </div>
                </div>
                
                {/* 中线 */}
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-blue-400 w-4 h-4" />
                    <span className="font-bold text-blue-400 text-sm md:text-base">日内中线</span>
                    <span className="text-xs text-slate-400 ml-auto">{signal.mediumTerm.timeframe}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">操作:</span>
                      <span className={`font-bold ${
                        signal.mediumTerm.action.includes("做多") ? "text-emerald-400" : 
                        signal.mediumTerm.action.includes("做空") ? "text-red-400" : "text-yellow-400"
                      }`}>
                        {signal.mediumTerm.action}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">盈亏比:</span>
                      <span className="text-purple-400">{signal.mediumTerm.riskReward}:1</span>
                    </div>
                    <div className="flex justify-between col-span-2 mt-1">
                      <span className="text-slate-400">建议入场:</span>
                      <span className="text-white font-mono text-xs">${formatPrice(signal.mediumTerm.entry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">止损:</span>
                      <span className="text-red-400 font-mono text-xs">${formatPrice(signal.mediumTerm.stop)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">目标:</span>
                      <span className="text-emerald-400 font-mono text-xs">${formatPrice(signal.mediumTerm.target)}</span>
                    </div>
                  </div>
                </div>
                
                {/* 长线 */}
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-purple-400 w-4 h-4" />
                    <span className="font-bold text-purple-400 text-sm md:text-base">波段长线</span>
                    <span className="text-xs text-slate-400 ml-auto">{signal.longTerm.timeframe}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">操作:</span>
                      <span className={`font-bold ${
                        signal.longTerm.action.includes("做多") ? "text-emerald-400" : 
                        signal.longTerm.action.includes("做空") ? "text-red-400" : "text-yellow-400"
                      }`}>
                        {signal.longTerm.action}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">盈亏比:</span>
                      <span className="text-purple-400">{signal.longTerm.riskReward}:1</span>
                    </div>
                    <div className="flex justify-between col-span-2 mt-1">
                      <span className="text-slate-400">建议入场:</span>
                      <span className="text-white font-mono text-xs">${formatPrice(signal.longTerm.entry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">止损:</span>
                      <span className="text-red-400 font-mono text-xs">${formatPrice(signal.longTerm.stop)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">目标:</span>
                      <span className="text-emerald-400 font-mono text-xs">${formatPrice(signal.longTerm.target)}</span>
                    </div>
                  </div>
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
                判断依据 ({signal.reason.length}条)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {signal.reason.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 text-sm leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作建议 */}
          {signal && (
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="text-purple-400 w-5 h-5" />
                综合操作建议
              </h3>
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 mb-4">
                <p className="text-slate-200 leading-relaxed">{signal.nextMove}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">风险等级</div>
                  <div className={`font-bold ${
                    signal.confidence > 70 ? "text-emerald-400" : 
                    signal.confidence > 50 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {signal.confidence > 70 ? "低风险" : signal.confidence > 50 ? "中风险" : "高风险"}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">建议仓位</div>
                  <div className="text-blue-400 font-bold">
                    {signal.confidence > 70 ? "15-25%" : signal.confidence > 50 ? "8-15%" : "3-8%"}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">策略类型</div>
                  <div className="text-purple-400 font-bold">{signal.strategy}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">信号时间</div>
                  <div className="text-slate-300 text-xs">{signal.time}</div>
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
                <span className={`px-3 py-1 rounded text-sm ${regimeColors[regime.color]} text-white font-medium`}>
                  {regime.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">信号强度</span>
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      signal && signal.signal > 0 ? "bg-emerald-500" : 
                      signal && signal.signal < 0 ? "bg-red-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${signal ? Math.abs(signal.signal) * 100 : 50}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">TFT置信度</span>
                <span className="text-blue-400 font-bold">{signal ? signal.confidence : 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">数据周期</span>
                <span className="text-white">{selectedInterval}</span>
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
