import { NextResponse } from "next/server";

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws";

export async function GET() {
  try {
    // 从 Binance 获取 BTC/USDT 实时价格
    const response = await fetch(
      "https://api.binance.me/api/v3/ticker/24hr?symbol=BTCUSDT"
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch from Binance");
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      symbol: "BTCUSDT",
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      volume24h: parseFloat(data.volume),
      quoteVolume24h: parseFloat(data.quoteVolume),
      fundingRate: null, // 需要通过 WebSocket 获取
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // 如果 API 失败，返回模拟数据作为后备
    return NextResponse.json({
      symbol: "BTCUSDT",
      price: 67500 + Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 5,
      high24h: 68500,
      low24h: 66500,
      volume24h: 28500000000,
      quoteVolume24h: 28500000000000,
      fundingRate: 0.012,
      timestamp: new Date().toISOString(),
      source: "mock",
    });
  }
}
