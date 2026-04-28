"use client";

import { useMemo } from "react";

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
  macd?: number;
  signal?: number;
  histogram?: number;
  k?: number;
  d?: number;
  j?: number;
  rsi?: number;
}

interface ChartProps {
  data: KLineData[];
}

// 计算EMA
function calcEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

// 计算MACD
function calcMACD(prices: number[]): { macd: number; signal: number; histogram: number }[] {
  const ema12: number[] = [];
  const ema26: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    ema12.push(calcEMA(prices.slice(0, i + 1), 12));
    ema26.push(calcEMA(prices.slice(0, i + 1), 26));
  }
  
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine: number[] = [];
  
  for (let i = 0; i < macdLine.length; i++) {
    signalLine.push(calcEMA(macdLine.slice(0, i + 1), 9));
  }
  
  return prices.map((_, i) => ({
    macd: macdLine[i],
    signal: signalLine[i],
    histogram: macdLine[i] - signalLine[i],
  }));
}

// 计算KDJ
function calcKDJ(klines: KLineData[]): { k: number; d: number; j: number }[] {
  const result: { k: number; d: number; j: number }[] = [];
  const period = 9;
  
  for (let i = 0; i < klines.length; i++) {
    if (i < period - 1) {
      result.push({ k: 50, d: 50, j: 50 });
      continue;
    }
    
    const highs = klines.slice(i - period + 1, i + 1).map(k => k.high);
    const lows = klines.slice(i - period + 1, i + 1).map(k => k.low);
    const highestHigh = Math.max(...highs);
    const lowestLow = Math.min(...lows);
    const close = klines[i].close;
    
    const rsv = highestHigh === lowestLow ? 50 : ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
    const prevK = i > 0 ? result[i - 1].k : 50;
    const prevD = i > 0 ? result[i - 1].d : 50;
    
    const k = (2 / 3) * prevK + (1 / 3) * rsv;
    const d = (2 / 3) * prevD + (1 / 3) * k;
    const j = 3 * k - 2 * d;
    
    result.push({ k, d, j });
  }
  
  return result;
}

// 计算RSI
function calcRSI(prices: number[], period: number = 14): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(50);
      continue;
    }
    
    let avgGain = 0, avgLoss = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) avgGain += change;
      else avgLoss -= change;
    }
    avgGain /= period;
    avgLoss /= period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - (100 / (1 + rs)));
  }
  
  return result;
}

export default function TradingChart({ data }: ChartProps) {
  // 处理完整数据
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    const closes = data.map(d => d.close);
    const macdData = calcMACD(closes);
    const kdjData = calcKDJ(data);
    const rsiData = calcRSI(closes);
    
    return data.map((d, i) => ({
      ...d,
      ma7: i >= 6 ? closes.slice(Math.max(0, i - 6), i + 1).reduce((a, b) => a + b, 0) / 7 : d.close,
      ma25: i >= 24 ? closes.slice(Math.max(0, i - 24), i + 1).reduce((a, b) => a + b, 0) / 25 : d.close,
      ma99: i >= 98 ? closes.slice(Math.max(0, i - 98), i + 1).reduce((a, b) => a + b, 0) / 99 : d.close,
      macd: macdData[i]?.macd || 0,
      signal: macdData[i]?.signal || 0,
      histogram: macdData[i]?.histogram || 0,
      k: kdjData[i]?.k || 50,
      d: kdjData[i]?.d || 50,
      j: kdjData[i]?.j || 50,
      rsi: rsiData[i] || 50,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-slate-900 rounded-lg">
        <div className="text-slate-400">加载K线数据中...</div>
      </div>
    );
  }

  // 计算价格范围
  const prices = chartData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // 计算指标范围
  const macdValues = chartData.flatMap(d => [d.macd || 0, d.signal || 0, d.histogram || 0]);
  const maxMacd = Math.max(...macdValues.map(Math.abs)) || 1;

  const latest = chartData[chartData.length - 1];
  const barWidth = 100 / chartData.length;

  return (
    <div className="w-full bg-slate-900 rounded-lg overflow-hidden font-mono text-[10px]">
      {/* 价格和MA标签 */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-slate-700 bg-slate-800">
        <div className="flex gap-3">
          <span className="text-amber-400">MA7: {latest.ma7.toFixed(2)}</span>
          <span className="text-blue-400">MA25: {latest.ma25.toFixed(2)}</span>
          <span className="text-purple-400">MA99: {latest.ma99.toFixed(2)}</span>
        </div>
        <div className="text-slate-400">
          最新: <span className={latest.close >= latest.open ? "text-emerald-400" : "text-red-400"}>
            {latest.close.toFixed(2)}
          </span>
        </div>
      </div>

      {/* K线图区域 */}
      <div className="relative h-[250px]" style={{ background: '#0f172a' }}>
        {/* 价格刻度 */}
        <div className="absolute right-0 top-0 h-full w-14 flex flex-col justify-between py-1 px-1 text-slate-500 text-[9px]">
          {[...Array(5)].map((_, i) => {
            const price = maxPrice - (priceRange / 4) * i;
            return <div key={i} className="text-right">{price.toFixed(0)}</div>;
          })}
        </div>
        
        {/* K线蜡烛 */}
        <div className="absolute left-0 right-14 top-0 bottom-0 flex items-center">
          {chartData.map((d, i) => {
            const isUp = d.close >= d.open;
            const color = isUp ? '#22c55e' : '#ef4444';
            const top = ((maxPrice - Math.max(d.open, d.close)) / priceRange) * 100;
            const bottom = ((maxPrice - Math.min(d.open, d.close)) / priceRange) * 100;
            const high = ((maxPrice - d.high) / priceRange) * 100;
            const low = ((maxPrice - d.low) / priceRange) * 100;
            
            return (
              <div
                key={i}
                className="relative flex-1 group"
                style={{ height: '100%' }}
              >
                {/* 最高价线 */}
                <div
                  className="absolute w-px bg-slate-400"
                  style={{ left: '50%', top: `${high}%`, height: `${top - high}%` }}
                />
                {/* 蜡烛体 */}
                <div
                  className="absolute mx-[1px]"
                  style={{
                    top: `${top}%`,
                    height: `${Math.max(1, bottom - top)}%`,
                    backgroundColor: color,
                    width: `${Math.max(20, barWidth * 60)}%`,
                    left: `${(100 - barWidth * 60) / 2}%`
                  }}
                />
                {/* 最低价线 */}
                <div
                  className="absolute w-px bg-slate-400"
                  style={{ left: '50%', top: `${bottom}%`, height: `${low - bottom}%` }}
                />
                
                {/* 分时线 */}
                <div
                  className="absolute w-px h-0.5 bg-yellow-400 opacity-60"
                  style={{
                    left: '50%',
                    top: `${((maxPrice - d.close) / priceRange) * 100}%`,
                  }}
                />
                
                {/* MA均线 */}
                <div
                  className="absolute w-px h-0.5 bg-amber-400 opacity-50"
                  style={{
                    left: '50%',
                    top: `${((maxPrice - d.ma7) / priceRange) * 100}%`,
                  }}
                />
                <div
                  className="absolute w-px h-0.5 bg-blue-400 opacity-50"
                  style={{
                    left: '50%',
                    top: `${((maxPrice - d.ma25) / priceRange) * 100}%`,
                  }}
                />
                
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
                  <div className="bg-slate-800 border border-slate-600 rounded p-2 text-[10px] whitespace-nowrap">
                    <div className="text-slate-400">{new Date(d.time).toLocaleString('zh-CN')}</div>
                    <div>开: <span className={isUp ? "text-emerald-400" : "text-red-400"}>{d.open.toFixed(2)}</span></div>
                    <div>高: <span className="text-white">{d.high.toFixed(2)}</span></div>
                    <div>低: <span className="text-white">{d.low.toFixed(2)}</span></div>
                    <div>收: <span className={isUp ? "text-emerald-400" : "text-red-400"}>{d.close.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MACD区域 */}
      <div className="border-t border-slate-700">
        <div className="px-2 py-1 bg-slate-800 text-cyan-400 text-[10px]">
          MACD(12,26,9) | DIF: {latest.macd?.toFixed(2)} | DEA: {latest.signal?.toFixed(2)} | MACD: {(latest.histogram || 0) >= 0 ? '+' : ''}{latest.histogram?.toFixed(2)}
        </div>
        <div className="relative h-[60px]" style={{ background: '#0f172a' }}>
          <div className="absolute left-0 right-14 top-0 bottom-0 flex items-center">
            {chartData.map((d, i) => {
              const hist = d.histogram || 0;
              const height = Math.min(100, (Math.abs(hist) / maxMacd) * 50);
              const isPos = hist >= 0;
              
              return (
                <div key={i} className="relative flex-1 flex items-center justify-center" style={{ height: '100%' }}>
                  <div
                    className="w-1 mx-[1px]"
                    style={{
                      height: `${height}%`,
                      backgroundColor: isPos ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KDJ区域 */}
      <div className="border-t border-slate-700">
        <div className="px-2 py-1 bg-slate-800 text-[10px]">
          KDJ(9,3,3) | <span className="text-amber-400">K:{latest.k?.toFixed(1)}</span> | <span className="text-blue-400">D:{latest.d?.toFixed(1)}</span> | <span className="text-purple-400">J:{latest.j?.toFixed(1)}</span>
        </div>
        <div className="relative h-[60px]" style={{ background: '#0f172a' }}>
          {[20, 50, 80].map(level => (
            <div
              key={level}
              className="absolute left-0 right-14 border-t border-slate-800 border-dashed"
              style={{ top: `${level}%` }}
            />
          ))}
          <div className="absolute left-0 right-14 top-0 bottom-0 flex items-center">
            {chartData.map((d, i) => (
              <div key={i} className="relative flex-1 flex items-center" style={{ height: '100%' }}>
                {/* K线 */}
                <div
                  className="absolute w-0.5 bg-amber-400"
                  style={{ left: '25%', top: `${100 - (d.k || 50)}%`, height: '33%' }}
                />
                {/* D线 */}
                <div
                  className="absolute w-0.5 bg-blue-400"
                  style={{ left: '50%', top: `${100 - (d.d || 50)}%`, height: '33%' }}
                />
                {/* J线 */}
                <div
                  className="absolute w-0.5 bg-purple-400"
                  style={{ left: '75%', top: `${100 - Math.min(100, Math.max(0, d.j || 50))}%`, height: '33%' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RSI区域 */}
      <div className="border-t border-slate-700">
        <div className="px-2 py-1 bg-slate-800 text-[10px]">
          RSI(14): <span className={latest.rsi && latest.rsi > 70 ? "text-red-400" : latest.rsi && latest.rsi < 30 ? "text-emerald-400" : "text-pink-400"}>
            {latest.rsi?.toFixed(1)}
          </span>
          {latest.rsi && latest.rsi > 70 && <span className="text-red-400 ml-2">超买</span>}
          {latest.rsi && latest.rsi < 30 && <span className="text-emerald-400 ml-2">超卖</span>}
        </div>
        <div className="relative h-[60px]" style={{ background: '#0f172a' }}>
          {[30, 50, 70].map(level => (
            <div
              key={level}
              className="absolute left-0 right-14 border-t border-slate-800 border-dashed"
              style={{ top: `${level}%` }}
            />
          ))}
          <div className="absolute left-0 right-14 top-0 bottom-0 flex items-center">
            {chartData.map((d, i) => {
              const rsi = d.rsi || 50;
              return (
                <div key={i} className="relative flex-1 flex items-center justify-center" style={{ height: '100%' }}>
                  <div
                    className="w-1 mx-[1px] bg-pink-400"
                    style={{ height: `${rsi}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 时间轴 */}
      <div className="flex justify-between px-2 py-1 text-slate-500 text-[9px] border-t border-slate-700 bg-slate-800">
        {chartData.filter((_, i) => i % Math.ceil(chartData.length / 6) === 0).map((d, i) => (
          <span key={i}>{new Date(d.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
        ))}
      </div>
    </div>
  );
}
