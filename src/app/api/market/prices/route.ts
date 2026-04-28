import { NextResponse } from "next/server";

const GETADEX_API_KEY = "792d26358c6657a9ca36b3815252e020";
const GETADEX_API_BASE = "https://api.getadex.io/api/v1";

export async function GET() {
  // 尝试 Getadex API
  try {
    const response = await fetch(
      `${GETADEX_API_BASE}/market/prices`,
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
        return NextResponse.json({
          success: true,
          source: "getadex",
          data: data.data.map((item: { symbol: string; price: number; change?: number; volume?: number }) => ({
            symbol: item.symbol.replace(/USDT|USD|-USDT/g, ""),
            price: parseFloat(String(item.price)),
            change24h: parseFloat(String(item.change || 0)),
            volume24h: parseFloat(String(item.volume || 0)),
          })),
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("Getadex prices API error:", error);
  }

  // 回退到 Binance
  try {
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];
    const results = [];

    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://api.binance.me/api/v3/ticker/24hr?symbol=${symbol}`
        );
        
        if (response.ok) {
          const data = await response.json();
          results.push({
            symbol: symbol.replace("USDT", ""),
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            volume24h: parseFloat(data.volume),
          });
        }
      } catch {
        // 静默处理
      }
    }

    if (results.length > 0) {
      return NextResponse.json({
        success: true,
        source: "binance",
        data: results,
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    console.error("Binance API error");
  }

  // 最后回退到模拟数据
  return NextResponse.json({
    success: true,
    source: "mock",
    data: [
      { symbol: "BTC", price: 67523.45, change24h: 2.34, volume24h: 28500000000 },
      { symbol: "ETH", price: 3521.78, change24h: 1.87, volume24h: 15200000000 },
      { symbol: "BNB", price: 578.23, change24h: -0.52, volume24h: 1850000000 },
      { symbol: "SOL", price: 142.87, change24h: 5.23, volume24h: 4200000000 },
      { symbol: "XRP", price: 0.5234, change24h: -1.12, volume24h: 2100000000 },
    ],
    timestamp: new Date().toISOString(),
  });
}
