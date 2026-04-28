"use client";

import { useEffect, useRef, useState } from "react";

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

interface OKXKlineChartProps {
  data: KLineData[];
}

export default function OKXKlineChart({ data }: OKXKlineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: KLineData } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 320 });

  // 监听容器大小变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height: Math.max(height, 300) });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 绘制K线图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸（使用设备像素比以获得清晰显示）
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    // 清除画布
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // 边距设置
    const margin = { top: 20, right: 80, bottom: 30, left: 10 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;
    const volumeHeight = chartHeight * 0.2;
    const priceHeight = chartHeight - volumeHeight;

    // 计算价格范围
    const prices = data.flatMap((d) => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const pricePadding = priceRange * 0.1;

    // K线宽度和间距
    const candleCount = data.length;
    const candleWidth = Math.max(2, (chartWidth / candleCount) * 0.7);
    const candleSpacing = chartWidth / candleCount;

    // 价格到Y坐标的转换
    const priceToY = (price: number) => {
      return margin.top + priceHeight - ((price - minPrice + pricePadding) / (priceRange + 2 * pricePadding)) * priceHeight;
    };

    // 成交量到Y坐标的转换
    const volumes = data.map((d) => d.volume);
    const maxVolume = Math.max(...volumes);

    const volumeToY = (vol: number) => {
      return margin.top + priceHeight + volumeHeight - (vol / maxVolume) * volumeHeight;
    };

    // 绘制网格线
    ctx.strokeStyle = "#2a2a4a";
    ctx.lineWidth = 0.5;
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const y = margin.top + (priceHeight / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    // 绘制分时线（收盘价连线）
    ctx.beginPath();
    ctx.strokeStyle = "#f6c343";
    ctx.lineWidth = 1.5;
    data.forEach((d, i) => {
      const x = margin.left + i * candleSpacing + candleSpacing / 2;
      const y = priceToY(d.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 绘制成交量柱状图
    data.forEach((d, i) => {
      const x = margin.left + i * candleSpacing + (candleSpacing - candleWidth) / 2;
      const isUp = d.close >= d.open;
      ctx.fillStyle = isUp ? "rgba(0, 200, 83, 0.5)" : "rgba(255, 80, 80, 0.5)";
      const volY = volumeToY(d.volume);
      ctx.fillRect(x, volY, candleWidth, margin.top + priceHeight + volumeHeight - volY);
    });

    // 绘制K线蜡烛图
    data.forEach((d, i) => {
      const x = margin.left + i * candleSpacing + candleSpacing / 2;
      const isUp = d.close >= d.open;
      const color = isUp ? "#00c853" : "#ff5050";
      const bodyTop = priceToY(Math.max(d.open, d.close));
      const bodyBottom = priceToY(Math.min(d.open, d.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      // 绘制蜡烛体
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // 绘制上下影线
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
    const drawMA = (maData: number[], color: string, label: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      let started = false;
      data.forEach((d, i) => {
        if (maData[i] && maData[i] !== d.close) {
          const x = margin.left + i * candleSpacing + candleSpacing / 2;
          const y = priceToY(maData[i]);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();

      // 显示最新值
      const lastMa = maData[maData.length - 1];
      if (lastMa) {
        ctx.fillStyle = color;
        ctx.font = "10px Arial";
        ctx.fillText(`${label}: ${lastMa.toFixed(2)}`, margin.left + chartWidth - 70, margin.top - 5);
      }
    };

    drawMA(data.map((d) => d.ma7), "#f59e0b", "MA7");
    drawMA(data.map((d) => d.ma25), "#3b82f6", "MA25");
    drawMA(data.map((d) => d.ma99), "#a855f7", "MA99");

    // 绘制价格刻度
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    const priceStep = (priceRange + 2 * pricePadding) / gridCount;
    for (let i = 0; i <= gridCount; i++) {
      const price = maxPrice + pricePadding - (priceStep * i);
      const y = margin.top + (priceHeight / gridCount) * i;
      ctx.fillText(price.toFixed(2), dimensions.width - 5, y + 3);
    }

    // 绘制时间刻度
    ctx.textAlign = "center";
    const timeStep = Math.ceil(candleCount / 8);
    data.forEach((d, i) => {
      if (i % timeStep === 0 || i === candleCount - 1) {
        const x = margin.left + i * candleSpacing + candleSpacing / 2;
        ctx.fillText(d.time, x, dimensions.height - 10);
      }
    });

    // 绘制成交量刻度
    ctx.textAlign = "right";
    ctx.fillText((maxVolume / 1000).toFixed(1) + "K", dimensions.width - 5, margin.top + priceHeight + 15);

  }, [data, dimensions]);

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const margin = { left: 10, right: 80 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const candleSpacing = chartWidth / data.length;
    const index = Math.floor((x - margin.left) / candleSpacing);

    if (index >= 0 && index < data.length) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        data: data[index],
      });
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-500">
        加载K线数据中...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-80">
      <canvas
        ref={canvasRef}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip && (
        <div
          className="absolute z-10 bg-slate-900/95 border border-slate-600 rounded-lg p-3 text-xs pointer-events-none"
          style={{
            left: Math.min(tooltip.x + 10, dimensions.width - 180),
            top: Math.min(tooltip.y + 10, dimensions.height - 120),
          }}
        >
          <div className="text-slate-400 mb-1">{tooltip.data.date} {tooltip.data.time}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-slate-500">开盘:</span>
            <span className={tooltip.data.close >= tooltip.data.open ? "text-emerald-400" : "text-red-400"}>
              {tooltip.data.open.toFixed(2)}
            </span>
            <span className="text-slate-500">最高:</span>
            <span className="text-white">{tooltip.data.high.toFixed(2)}</span>
            <span className="text-slate-500">最低:</span>
            <span className="text-white">{tooltip.data.low.toFixed(2)}</span>
            <span className="text-slate-500">收盘:</span>
            <span className={tooltip.data.close >= tooltip.data.open ? "text-emerald-400" : "text-red-400"}>
              {tooltip.data.close.toFixed(2)}
            </span>
            <span className="text-slate-500">MA7:</span>
            <span className="text-amber-400">{tooltip.data.ma7.toFixed(2)}</span>
            <span className="text-slate-500">MA25:</span>
            <span className="text-blue-400">{tooltip.data.ma25.toFixed(2)}</span>
            <span className="text-slate-500">MA99:</span>
            <span className="text-purple-400">{tooltip.data.ma99.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
