"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Brain,
  Eye,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];

interface KLineData {
  time: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Signal {
  id: number;
  symbol: string;
  strategy: string;
  signal: number;
  direction: "long" | "short" | "neutral";
  confidence: number;
  time: string;
}

interface TftSignal {
  time: string;
  signal: number;
  confidence: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

// 获取真实市场数据
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

// 获取真实K线数据
async function fetchKlineData(symbol: string, interval: string = "1h"): Promise<KLineData[]> {
  try {
    const response = await fetch(`/api/market/klines?symbol=${symbol}&interval=${interval}&limit=100`);
    if (response.ok) {
      const result = await response.json();
      return result.data.map((k: { time: string; open: number; high: number; low: number; close: number; volume: number }) => ({
        time: new Date(k.time).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        date: new Date(k.time).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.volume,
      }));
    }
  } catch {
    console.log("Using mock kline data");
  }
  return [];
}

// 生成模拟信号
function generateSignals(): Signal[] {
  return [
    { id: 1, symbol: "BTCUSDT", strategy: "TFT融合信号", signal: 0.72, direction: "long", confidence: 85, time: "刚刚" },
    { id: 2, symbol: "ETHUSDT", strategy: "趋势突破", signal: 0.58, direction: "long", confidence: 72, time: "5秒前" },
    { id: 3, symbol: "BNBUSDT", strategy: "资金费率套利", signal: 0.45, direction: "neutral", confidence: 65, time: "15秒前" },
    { id: 4, symbol: "SOLUSDT", strategy: "动量加速", signal: -0.32, direction: "short", confidence: 58, time: "30秒前" },
    { id: 5, symbol: "BTCUSDT", strategy: "布林带收口", signal: 0.68, direction: "long", confidence: 78, time: "1分钟前" },
    { id: 6, symbol: "ETHUSDT", strategy: "MACD背离", signal: -0.21, direction: "short", confidence: 52, time: "2分钟前" },
    { id: 7, symbol: "XRPUSDT", strategy: "RSI超卖", signal: 0.82, direction: "long", confidence: 88, time: "3分钟前" },
    { id: 8, symbol: "BTCUSDT", strategy: "MA均线交叉", signal: 0.55, direction: "long", confidence: 70, time: "5分钟前" },
  ];
}

// 生成TFT信号
function generateTftSignals(): TftSignal[] {
  return [
    { time: "00:00", signal: 0.62, confidence: 78 },
    { time: "04:00", signal: 0.58, confidence: 75 },
    { time: "08:00", signal: 0.71, confidence: 82 },
    { time: "12:00", signal: 0.45, confidence: 65 },
    { time: "16:00", signal: 0.33, confidence: 58 },
    { time: "20:00", signal: 0.68, confidence: 76 },
    { time: "24:00", signal: 0.72, confidence: 85 },
  ];
}

export function SignalsMonitor() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [klineData, setKlineData] = useState<KLineData[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [tftSignals, setTftSignals] = useState<TftSignal[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dataSource, setDataSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [klines, markets] = await Promise.all([
        fetchKlineData(selectedSymbol, timeframe),
        fetchMarketData(),
      ]);
      
      if (klines.length > 0) {
        setKlineData(klines);
      } else {
        // 使用模拟数据作为后备
        const mockKlines: KLineData[] = [];
        const basePrice = selectedSymbol === "BTCUSDT" ? 67000 : selectedSymbol === "ETHUSDT" ? 3500 : 500;
        const now = Date.now();
        
        for (let i = 0; i < 100; i++) {
          const time = new Date(now - (100 - i) * 3600000);
          const volatility = selectedSymbol === "BTCUSDT" ? 0.02 : 0.025;
          const change = (Math.random() - 0.5) * volatility;
          const price = basePrice * Math.pow(1 + change, i / 10);
          
          mockKlines.push({
            time: time.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            date: time.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
            open: price,
            high: price * 1.01,
            low: price * 0.99,
            close: price * (1 + (Math.random() - 0.5) * 0.01),
            volume: Math.random() * 1000 + 500,
          });
        }
        setKlineData(mockKlines);
      }
      
      if (markets.length > 0) {
        setMarketData(markets);
        setDataSource("binance");
      } else {
        setDataSource("mock");
      }
      
      setSignals(generateSignals());
      setTftSignals(generateTftSignals());
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 每30秒自动刷新
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const currentPrice = klineData.length > 0 ? klineData[klineData.length - 1].close : 0;
  const prevPrice = klineData.length > 1 ? klineData[klineData.length - 2].close : 0;
  const priceChange = currentPrice - prevPrice;
  const priceChangePercent = prevPrice > 0 ? ((priceChange / prevPrice) * 100).toFixed(2) : "0";
  const isUp = priceChange >= 0;

  // 找到当前币种的实时数据
  const currentMarket = marketData.find(m => m.symbol === selectedSymbol.replace("USDT", ""));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">信号监控</h1>
          <p className="text-muted-foreground">
            实时行情与AI交易信号
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Badge variant="outline" className={cn(
            dataSource === "binance" ? "text-green-600 border-green-500" : "text-yellow-600 border-yellow-500"
          )}>
            {dataSource === "binance" ? "Binance 实时" : "模拟数据"}
          </Badge>
          <Button size="sm" variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            刷新数据
          </Button>
        </div>
      </div>

      {/* Price Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {symbols.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <div className="text-3xl font-bold">
                  ${(currentMarket?.price || currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={cn("flex items-center gap-2 text-sm", (currentMarket?.change24h || 0) >= 0 ? "text-green-500" : "text-red-500")}>
                  {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span>
                    {currentMarket?.change24h 
                      ? `${(currentMarket.change24h) >= 0 ? "+" : ""}${currentMarket.change24h.toFixed(2)}%`
                      : `${isUp ? "+" : ""}${priceChangePercent}%`
                    }
                  </span>
                  {currentMarket && <span className="text-muted-foreground">24h</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList>
                  <TabsTrigger value="1m">1m</TabsTrigger>
                  <TabsTrigger value="5m">5m</TabsTrigger>
                  <TabsTrigger value="1h">1h</TabsTrigger>
                  <TabsTrigger value="4h">4h</TabsTrigger>
                  <TabsTrigger value="1d">1d</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Signals */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* K-Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {selectedSymbol} K线
              {dataSource === "binance" && (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-500">
                  实时
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={klineData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" interval="preserveStartEnd" />
                <YAxis className="text-xs" domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isUp ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TFT Signal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              TFT融合信号
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl font-bold mb-2">
                <span className={tftSignals[tftSignals.length - 1]?.signal > 0 ? "text-green-500" : "text-red-500"}>
                  {(tftSignals[tftSignals.length - 1]?.signal * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                置信度: {tftSignals[tftSignals.length - 1]?.confidence}%
              </p>
            </div>

            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={tftSignals}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" domain={[-1, 1]} />
                <Tooltip />
                <Bar
                  dataKey="signal"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">模型版本</span>
                <span className="font-medium">TFT-v4.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">序列长度</span>
                <span className="font-medium">64 K线</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">特征维度</span>
                <span className="font-medium">1500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">更新时间</span>
                <span className="font-medium">刚刚</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            最新交易信号
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>交易对</TableHead>
                <TableHead>策略</TableHead>
                <TableHead>方向</TableHead>
                <TableHead>信号强度</TableHead>
                <TableHead>置信度</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell className="text-muted-foreground">{signal.time}</TableCell>
                  <TableCell className="font-medium">{signal.symbol}</TableCell>
                  <TableCell>{signal.strategy}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        signal.direction === "long" && "bg-green-500/10 text-green-600 border-green-500/20",
                        signal.direction === "short" && "bg-red-500/10 text-red-600 border-red-500/20",
                        signal.direction === "neutral" && "bg-gray-500/10 text-gray-600 border-gray-500/20"
                      )}
                    >
                      {signal.direction === "long" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                      {signal.direction === "short" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {signal.direction.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            signal.signal > 0 ? "bg-green-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.abs(signal.signal) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {(signal.signal * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{signal.confidence}%</span>
                      {signal.confidence >= 80 && (
                        <Badge variant="secondary" className="text-xs">强</Badge>
                      )}
                      {signal.confidence >= 60 && signal.confidence < 80 && (
                        <Badge variant="secondary" className="text-xs">中</Badge>
                      )}
                      {signal.confidence < 60 && (
                        <Badge variant="secondary" className="text-xs bg-gray-500/10 text-gray-600">弱</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" />
                      待执行
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Market Regime */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            市场体制识别 (HMM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: "震荡", color: "bg-yellow-500", active: false, probability: 32 },
              { name: "上涨趋势", color: "bg-green-500", active: true, probability: 45 },
              { name: "下跌趋势", color: "bg-red-500", active: false, probability: 15 },
              { name: "高波动", color: "bg-purple-500", active: false, probability: 8 },
            ].map((regime) => (
              <div
                key={regime.name}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  regime.active && "border-green-500 bg-green-500/5"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("h-3 w-3 rounded-full", regime.color)} />
                  <span className="font-medium">{regime.name}</span>
                  {regime.active && (
                    <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-600">
                      当前
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">{regime.probability}%</div>
                <p className="text-xs text-muted-foreground">概率</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
