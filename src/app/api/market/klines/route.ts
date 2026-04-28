import { NextResponse } from "next/server";

const GETADEX_API_KEY = "792d26358c6657a9ca36b3815252e020";
const GETADEX_API_BASE = "https://api.getadex.io/api/v1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTC/USDT";
  const interval = searchParams.get("interval") || "1h";
  const limit = searchParams.get("limit") || "100";

  try {
    // 尝试 Getadex API
    const response = await fetch(
      `${GETADEX_API_BASE}/market/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      {
        headers: {
          "X-API-KEY": GETADEX_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        const klines = data.data.map((k: {
          time?: string;
          open_time?: number;
          open?: number;
          high?: number;
          low?: number;
          close?: number;
          volume?: number;
        }) => ({
          time: k.time || new Date(k.open_time || Date.now()).toISOString(),
          open: parseFloat(String(k.open || 0)),
          high: parseFloat(String(k.high || 0)),
          low: parseFloat(String(k.low || 0)),
          close: parseFloat(String(k.close || 0)),
          volume: parseFloat(String(k.volume || 0)),
        }));

        return NextResponse.json({
          success: true,
          source: "getadex",
          symbol,
          interval,
          data: klines,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("Getadex API error:", error);
  }

  // 回退到 Binance
  try {
    const binanceSymbol = symbol.replace("/", "").replace("-", "");
    const response = await fetch(
      `https://api.binance.me/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
    );

    if (response.ok) {
      const data = await response.json();
      const klines = data.map((k: string[]) => ({
        time: new Date(parseInt(k[0])).toISOString(),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));

      return NextResponse.json({
        success: true,
        source: "binance",
        symbol,
        interval,
        data: klines,
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    console.error("Binance API error");
  }

  // 最后回退到模拟数据
  const mockKlines = [];
  const basePrice = symbol.includes("BTC") ? 67500 : symbol.includes("ETH") ? 3500 : 500;
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    const time = new Date(now - (100 - i) * 3600000);
    const volatility = symbol.includes("BTC") ? 0.015 : 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const price = basePrice * Math.pow(1 + change, i / 10);

    mockKlines.push({
      time: time.toISOString(),
      open: price,
      high: price * (1 + Math.random() * 0.01),
      low: price * (1 - Math.random() * 0.01),
      close: price * (1 + (Math.random() - 0.5) * 0.008),
      volume: Math.random() * 1000 + 500,
    });
  }

  return NextResponse.json({
    success: true,
    source: "mock",
    symbol,
    interval,
    data: mockKlines,
    timestamp: new Date().toISOString(),
  });
}
