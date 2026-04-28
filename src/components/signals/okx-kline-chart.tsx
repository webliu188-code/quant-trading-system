"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  // MACD
  macd?: number;
  signal?: number;
  histogram?: number;
  // KDJ
  k?: number;
  d?: number;
  j?: number;
  // RSI
  rsi?: number;
}

interface OKXKlineChartProps {
  data: KLineData[];
}

// 计算 EMA
function calculateEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

// 计算 MACD
function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number }[] {
  const ema12: number[] = [];
  const ema26: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    ema12.push(calculateEMA(prices.slice(0, i + 1), 12));
    ema26.push(calculateEMA(prices.slice(0, i + 1), 26));
  }
  
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine: number[] = [];
  
  for (let i = 0; i < macdLine.length; i++) {
    signalLine.push(calculateEMA(macdLine.slice(0, i + 1), 9));
  }
  
  return prices.map((_, i) => ({
    macd: macdLine[i],
    signal: signalLine[i],
    histogram: macdLine[i] - signalLine[i],
  }));
}

// 计算 KDJ
function calculateKDJ(klines: KLineData[], period: number = 9): { k: number; d: number; j: number }[] {
  const result: { k: number; d: number; j: number }[] = [];
  
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

// 计算 RSI
function calculateRSI(prices: number[], period: number = 14): number[] {
  const result: number[] = [];
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(50);
      continue;
    }
    
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    if (i === period) {
      avgGain = prices.slice(1, period + 1).reduce((sum, p, idx) => {
        const c = p - prices[idx];
        return sum + (c > 0 ? c : 0);
      }, 0) / period;
      avgLoss = prices.slice(1, period + 1).reduce((sum, p, idx) => {
        const c = p - prices[idx];
        return sum + (c < 0 ? -c : 0);
      }, 0) / period;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - (100 / (1 + rs)));
  }
  
  return result;
}

export default function OKXKlineChart({ data }: OKXKlineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: KLineData } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 处理数据 - 添加所有指标
  const processedData = useCallback((): KLineData[] => {
    if (data.length === 0) return [];
    
    const closes = data.map(d => d.close);
    
    // 计算 MA
    const withMA = data.map((d, i) => {
      const ma7 = i >= 6 ? closes.slice(Math.max(0, i - 6), i + 1).reduce((a, b) => a + b, 0) / 7 : d.close;
      const ma25 = i >= 24 ? closes.slice(Math.max(0, i - 24), i + 1).reduce((a, b) => a + b, 0) / 25 : d.close;
      const ma99 = i >= 98 ? closes.slice(Math.max(0, i - 98), i + 1).reduce((a, b) => a + b, 0) / 99 : d.close;
      return { ...d, ma7, ma25, ma99 };
    });
    
    // 计算 MACD
    const macdData = calculateMACD(closes);
    const withMACD = withMA.map((d, i) => ({
      ...d,
      macd: macdData[i]?.macd || 0,
      signal: macdData[i]?.signal || 0,
      histogram: macdData[i]?.histogram || 0,
    }));
    
    // 计算 KDJ
    const kdjData = calculateKDJ(withMACD);
    const withKDJ = withMACD.map((d, i) => ({
      ...d,
      k: kdjData[i]?.k || 50,
      d: kdjData[i]?.d || 50,
      j: kdjData[i]?.j || 50,
    }));
    
    // 计算 RSI
    const rsiData = calculateRSI(closes);
    return withKDJ.map((d, i) => ({
      ...d,
      rsi: rsiData[i] || 50,
    }));
  }, [data]);

  // 监听容器大小变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height: Math.max(height, 400) });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 绘制图表
  useEffect(() => {
    const canvas = canvasRef.current;
    const chartData = processedData();
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    // 清除画布
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // 布局设置
    const padding = { top: 10, right: 70, bottom: 10, left: 10 };
    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeight = dimensions.height - padding.top - padding.bottom;
    
    // 分配高度：K线(55%), MACD(15%), KDJ(15%), RSI(15%)
    const klineHeight = chartHeight * 0.55;
    const indicatorHeight = chartHeight * 0.15;
    const gap = 5;

    // ===== K线图 =====
    const klineTop = padding.top;
    
    // 计算价格范围
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const pricePadding = priceRange * 0.08;

    const candleCount = chartData.length;
    const candleWidth = Math.max(2, (chartWidth / candleCount) * 0.65);
    const candleSpacing = chartWidth / candleCount;

    const priceToY = (price: number) => {
      return klineTop + klineHeight - ((price - minPrice + pricePadding) / (priceRange + 2 * pricePadding)) * klineHeight;
    };

    // 绘制网格
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = klineTop + (klineHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // 绘制分时线
    ctx.beginPath();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.5;
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const y = priceToY(d.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 绘制K线蜡烛
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const isUp = d.close >= d.open;
      const color = isUp ? "#22c55e" : "#ef4444";
      
      const bodyTop = priceToY(Math.max(d.open, d.close));
      const bodyBottom = priceToY(Math.min(d.open, d.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, priceToY(d.high));
      ctx.lineTo(x, bodyTop);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, bodyBottom);
      ctx.lineTo(x, priceToY(d.low));
      ctx.stroke();
    });

    // 绘制MA均线
    const drawLine = (key: keyof KLineData, color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      let started = false;
      chartData.forEach((d, i) => {
        const value = d[key] as number;
        if (value) {
          const x = padding.left + i * candleSpacing + candleSpacing / 2;
          const y = priceToY(value);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    };

    drawLine("ma7", "#f59e0b");
    drawLine("ma25", "#3b82f6");
    drawLine("ma99", "#a855f7");

    // 价格刻度
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px Arial";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice + pricePadding - ((priceRange + 2 * pricePadding) / 5) * i;
      const y = klineTop + (klineHeight / 5) * i;
      ctx.fillText(price.toFixed(2), dimensions.width - 2, y + 3);
    }

    // MA标签
    const lastData = chartData[chartData.length - 1];
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`MA7: ${lastData.ma7.toFixed(2)}`, dimensions.width - 2, klineTop - 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fillText(`MA25: ${lastData.ma25.toFixed(2)}`, dimensions.width - 90, klineTop - 2);
    ctx.fillStyle = "#a855f7";
    ctx.fillText(`MA99: ${lastData.ma99.toFixed(2)}`, dimensions.width - 170, klineTop - 2);

    // ===== MACD 图 =====
    const macdTop = klineTop + klineHeight + gap;
    
    // MACD 分隔线
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, macdTop);
    ctx.lineTo(padding.left + chartWidth, macdTop);
    ctx.stroke();

    const macdValues = chartData.map(d => d.macd || 0);
    const signalValues = chartData.map(d => d.signal || 0);
    const histValues = chartData.map(d => d.histogram || 0);
    const allMacdValues = [...macdValues, ...signalValues, ...histValues];
    const maxMacd = Math.max(...allMacdValues.map(Math.abs));
    const macdRange = maxMacd || 1;

    const macdToY = (value: number) => {
      return macdTop + indicatorHeight / 2 - (value / macdRange) * (indicatorHeight / 2) * 0.8;
    };

    // MACD 标签
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("MACD", padding.left + 5, macdTop - 2);

    // 绘制 MACD
    ctx.beginPath();
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 1;
    let started = false;
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const y = macdToY(d.macd || 0);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 1;
    started = false;
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const y = macdToY(d.signal || 0);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // MACD 柱状图
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const hist = d.histogram || 0;
      const barHeight = Math.abs(hist / macdRange) * (indicatorHeight / 2) * 0.8;
      const barTop = hist >= 0 ? macdToY(hist) : macdToY(0);
      ctx.fillStyle = hist >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)";
      ctx.fillRect(x - candleWidth / 3, barTop, candleWidth * 0.6, barHeight);
    });

    // MACD 刻度
    ctx.fillStyle = "#64748b";
    ctx.font = "8px Arial";
    ctx.fillText(maxMacd.toFixed(2), dimensions.width - 2, macdTop + 8);
    ctx.fillText((-maxMacd).toFixed(2), dimensions.width - 2, macdTop + indicatorHeight - 2);

    // ===== KDJ 图 =====
    const kdjTop = macdTop + indicatorHeight + gap;
    
    ctx.strokeStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(padding.left, kdjTop);
    ctx.lineTo(padding.left + chartWidth, kdjTop);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.fillText("KDJ", padding.left + 5, kdjTop - 2);

    // KDJ 网格线 (20, 50, 80)
    ctx.strokeStyle = "#1e293b";
    [20, 50, 80].forEach(level => {
      const y = kdjTop + indicatorHeight - (level / 100) * indicatorHeight;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    const kdjToY = (value: number) => {
      return kdjTop + indicatorHeight - (value / 100) * indicatorHeight;
    };

    // 绘制 K
    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    started = false;
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const y = kdjToY(d.k || 50);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 绘制 D
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1;
    started = false;
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const y = kdjToY(d.d || 50);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 绘制 J
    ctx.beginPath();
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 1;
    started = false;
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const y = kdjToY(d.j || 50);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // KDJ 刻度
    ctx.fillStyle = "#64748b";
    ctx.font = "8px Arial";
    ctx.fillText("100", dimensions.width - 2, kdjTop + 8);
    ctx.fillText("50", dimensions.width - 2, kdjTop + indicatorHeight / 2 + 3);
    ctx.fillText("0", dimensions.width - 2, kdjTop + indicatorHeight - 2);

    // KDJ 当前值
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`K:${lastData.k?.toFixed(1)}`, dimensions.width - 60, kdjTop - 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fillText(`D:${lastData.d?.toFixed(1)}`, dimensions.width - 110, kdjTop - 2);
    ctx.fillStyle = "#a855f7";
    ctx.fillText(`J:${lastData.j?.toFixed(1)}`, dimensions.width - 160, kdjTop - 2);

    // ===== RSI 图 =====
    const rsiTop = kdjTop + indicatorHeight + gap;
    
    ctx.strokeStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(padding.left, rsiTop);
    ctx.lineTo(padding.left + chartWidth, rsiTop);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.fillText("RSI(14)", padding.left + 5, rsiTop - 2);

    // RSI 网格线 (30, 50, 70)
    ctx.strokeStyle = "#1e293b";
    [30, 50, 70].forEach(level => {
      const y = rsiTop + indicatorHeight - (level / 100) * indicatorHeight;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    const rsiToY = (value: number) => {
      return rsiTop + indicatorHeight - (value / 100) * indicatorHeight;
    };

    // 绘制 RSI 线
    ctx.beginPath();
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 1.5;
    started = false;
    chartData.forEach((d, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const y = rsiToY(d.rsi || 50);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // RSI 当前值
    const rsiColor = (lastData.rsi || 50) > 70 ? "#ef4444" : (lastData.rsi || 50) < 30 ? "#22c55e" : "#ec4899";
    ctx.fillStyle = rsiColor;
    ctx.font = "10px Arial";
    ctx.fillText(`RSI: ${lastData.rsi?.toFixed(1)}`, dimensions.width - 50, rsiTop - 2);

    // RSI 刻度
    ctx.fillStyle = "#64748b";
    ctx.font = "8px Arial";
    ctx.fillText("100", dimensions.width - 2, rsiTop + 8);
    ctx.fillText("50", dimensions.width - 2, rsiTop + indicatorHeight / 2 + 3);
    ctx.fillText("0", dimensions.width - 2, rsiTop + indicatorHeight - 2);

    // 时间刻度
    ctx.fillStyle = "#64748b";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    const timeStep = Math.ceil(candleCount / 6);
    chartData.forEach((d, i) => {
      if (i % timeStep === 0 || i === candleCount - 1) {
        const x = padding.left + i * candleSpacing + candleSpacing / 2;
        const time = new Date(d.time).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
        ctx.fillText(time, x, dimensions.height - 2);
      }
    });

  }, [data, dimensions, processedData]);

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const chartData = processedData();
    if (!canvas || chartData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chartWidth = dimensions.width - 80;
    const candleSpacing = chartWidth / chartData.length;
    const index = Math.floor((x - 10) / candleSpacing);

    if (index >= 0 && index < chartData.length) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        data: chartData[index],
      });
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const chartData = processedData();

  if (chartData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-slate-500 bg-slate-900 rounded-lg">
        <div className="text-center">
          <div className="animate-pulse">加载K线数据中...</div>
          <div className="text-xs text-slate-600 mt-2">数据来源: Getadex / Binance</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-96 relative bg-slate-900 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="cursor-crosshair w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip && (
        <div
          className="absolute z-20 bg-slate-800/95 border border-slate-600 rounded-lg p-3 text-xs shadow-xl pointer-events-none"
          style={{
            left: Math.min(tooltip.x + 15, dimensions.width - 200),
            top: Math.max(tooltip.y - 150, 10),
          }}
        >
          <div className="text-slate-400 mb-2 border-b border-slate-700 pb-1">
            {new Date(tooltip.data.time).toLocaleDateString("zh-CN")} {new Date(tooltip.data.time).toLocaleTimeString("zh-CN")}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">开盘:</span>
              <span className={tooltip.data.close >= tooltip.data.open ? "text-emerald-400" : "text-red-400"}>
                {tooltip.data.open.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">最高:</span>
              <span className="text-white">{tooltip.data.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">最低:</span>
              <span className="text-white">{tooltip.data.low.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">收盘:</span>
              <span className={tooltip.data.close >= tooltip.data.open ? "text-emerald-400" : "text-red-400"}>
                {tooltip.data.close.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-700 mt-2 pt-2">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">MA7:</span>
                <span className="text-amber-400">{tooltip.data.ma7.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">MA25:</span>
                <span className="text-blue-400">{tooltip.data.ma25.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">MA99:</span>
                <span className="text-purple-400">{tooltip.data.ma99.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-slate-700 mt-2 pt-2">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">MACD:</span>
                <span className="text-cyan-400">{tooltip.data.macd?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Signal:</span>
                <span className="text-orange-400">{tooltip.data.signal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">RSI:</span>
                <span className="text-pink-400">{tooltip.data.rsi?.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
