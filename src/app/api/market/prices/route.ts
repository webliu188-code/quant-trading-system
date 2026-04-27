import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 获取多个币种数据
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
        // 静默处理单个币种错误
      }
    }

    // 如果获取到真实数据，返回
    if (results.length > 0) {
      return NextResponse.json({
        success: true,
        source: "binance",
        data: results,
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    // 继续使用模拟数据
  }

  // 模拟数据后备
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
