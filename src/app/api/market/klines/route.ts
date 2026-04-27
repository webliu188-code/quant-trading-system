import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const interval = searchParams.get("interval") || "1h";
  const limit = searchParams.get("limit") || "100";

  try {
    // 从 Binance 获取 K线数据
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );

    if (response.ok) {
      const data = await response.json();
      const klines = data.map((k: string[]) => ({
        time: new Date(k[0]).toISOString(),
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
    // 继续使用模拟数据
  }

  // 模拟 K线数据后备
  const mockKlines = [];
  const basePrice = symbol === "BTCUSDT" ? 67000 : symbol === "ETHUSDT" ? 3500 : 500;
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    const time = new Date(now - (100 - i) * 3600000);
    const volatility = symbol === "BTCUSDT" ? 0.02 : 0.025;
    const change = (Math.random() - 0.5) * volatility;
    const price = basePrice * Math.pow(1 + change, i / 10);

    mockKlines.push({
      time: time.toISOString(),
      open: price,
      high: price * 1.01,
      low: price * 0.99,
      close: price * (1 + (Math.random() - 0.5) * 0.01),
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
