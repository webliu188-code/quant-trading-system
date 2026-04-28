import { NextResponse } from "next/server";

const GETADEX_API_KEY = "792d26358c6657a9ca36b3815252e020";
const GETADEX_API_BASE = "https://api.getadex.io/api/v1";

export async function GET() {
  // 尝试 Getadex API
  try {
    const response = await fetch(
      `${GETADEX_API_BASE}/market/price?symbol=BTC/USDT`,
      {
        headers: {
          "X-API-KEY": GETADEX_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      return NextResponse.json({
        symbol: "BTCUSDT",
        price: parseFloat(String(data.price || data.data?.price || 0)),
        change24h: parseFloat(String(data.change || data.data?.change || 0)),
        high24h: parseFloat(String(data.high || data.data?.high || 0)),
        low24h: parseFloat(String(data.low || data.data?.low || 0)),
        volume24h: parseFloat(String(data.volume || data.data?.volume || 0)),
        quoteVolume24h: parseFloat(String(data.quoteVolume || data.data?.quoteVolume || 0)),
        fundingRate: null,
        source: "getadex",
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    console.error("Getadex BTC API error");
  }

  // 回退到 Binance
  try {
    const response = await fetch(
      "https://api.binance.me/api/v3/ticker/24hr?symbol=BTCUSDT"
    );
    
    if (response.ok) {
      const data = await response.json();
      
      return NextResponse.json({
        symbol: "BTCUSDT",
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume24h: parseFloat(data.volume),
        quoteVolume24h: parseFloat(data.quoteVolume),
        fundingRate: null,
        source: "binance",
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    console.error("Binance BTC API error");
  }

  // 最后回退到模拟数据
  return NextResponse.json({
    symbol: "BTCUSDT",
    price: 67500 + Math.random() * 1000,
    change24h: (Math.random() - 0.5) * 5,
    high24h: 68500,
    low24h: 66500,
    volume24h: 28500000000,
    quoteVolume24h: 28500000000000,
    fundingRate: 0.012,
    source: "mock",
    timestamp: new Date().toISOString(),
  });
}
