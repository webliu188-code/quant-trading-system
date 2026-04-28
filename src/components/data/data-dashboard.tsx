"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Users,
  Newspaper,
  Cpu,
  Wifi,
} from "lucide-react";

import { cn } from "@/lib/utils";

const dataSources = [
  {
    id: 1,
    name: "Binance",
    type: "交易所",
    icon: BarChart3,
    color: "bg-yellow-500",
    status: "connected",
    latency: "12ms",
    quota: { used: 8500, total: 10000 },
    data: ["K线", "深度", "标记价", "资金费率"],
    apiKey: false,
  },
  {
    id: 2,
    name: "OKX",
    type: "交易所",
    icon: Globe,
    color: "bg-green-500",
    status: "connected",
    latency: "18ms",
    quota: { used: 6200, total: 10000 },
    data: ["K线", "深度", "标记价"],
    apiKey: false,
  },
  {
    id: 3,
    name: "Bybit",
    type: "交易所",
    icon: Activity,
    color: "bg-blue-500",
    status: "connected",
    latency: "15ms",
    quota: { used: 5800, total: 10000 },
    data: ["K线", "深度", "标记价"],
    apiKey: false,
  },
  {
    id: 4,
    name: "CoinGlass",
    type: "链上数据",
    icon: Database,
    color: "bg-purple-500",
    status: "connected",
    latency: "45ms",
    quota: { used: 3200, total: 10000 },
    data: ["持仓量", "多空比", "费率历史"],
    apiKey: true,
  },
  {
    id: 5,
    name: "Glassnode",
    type: "链上指标",
    icon: TrendingUp,
    color: "bg-orange-500",
    status: "connected",
    latency: "120ms",
    quota: { used: 1200, total: 5000 },
    data: ["MVRV", "SOPR", "交易所净流量"],
    apiKey: true,
  },
  {
    id: 6,
    name: "CryptoQuant",
    type: "链上数据",
    icon: Cpu,
    color: "bg-cyan-500",
    status: "warning",
    latency: "200ms",
    quota: { used: 4500, total: 5000 },
    data: ["交易所净头寸", "杠杆率"],
    apiKey: true,
  },
  {
    id: 7,
    name: "LunarCrush",
    type: "社交数据",
    icon: Users,
    color: "bg-pink-500",
    status: "connected",
    latency: "80ms",
    quota: { used: 2100, total: 5000 },
    data: ["社交情绪", "AI情绪评分"],
    apiKey: true,
  },
  {
    id: 8,
    name: "The Tie",
    type: "新闻数据",
    icon: Newspaper,
    color: "bg-indigo-500",
    status: "connected",
    latency: "95ms",
    quota: { used: 800, total: 2000 },
    data: ["机构新闻情绪"],
    apiKey: true,
  },
];


const indicators = [
  { name: "BTC MVRV", value: 2.45, signal: "normal", description: "Market Value to Realized Value" },
  { name: "BTC SOPR", value: 1.12, signal: "normal", description: "Spent Output Profit Ratio" },
  { name: "ETH Gas", value: 28, signal: "normal", description: "当前Gas价格 (Gwei)" },
  { name: "BTC Dominance", value: 52.3, signal: "normal", description: "BTC市场占比" },
  { name: "Total Market Cap", value: 2.45, signal: "up", description: "加密总市值 (万亿USD)" },
  { name: "Fear & Greed", value: 68, signal: "normal", description: "恐惧贪婪指数" },
];

export function DataDashboard() {
  // 实时市场数据状态
  const [marketPrices, setMarketPrices] = useState<Record<string, { price: number; change: number }>>({});
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // 获取实时价格
  const fetchMarketPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/market/prices");
      const data = await res.json();
      if (data.source === "binance" && data.data) {
        const prices: Record<string, { price: number; change: number }> = {};
        data.data.forEach((item: any) => {
          prices[item.symbol] = {
            price: parseFloat(item.price),
            change: parseFloat(item.changePercent)
          };
        });
        setMarketPrices(prices);
        setLastUpdate(new Date().toLocaleTimeString("zh-CN"));
      }
    } catch (error) {
      console.error("获取市场数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketPrices();
    const interval = setInterval(fetchMarketPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketPrices]);

  // 基于真实价格生成市场数据
  const getMarketData = () => {
    const prices = marketPrices && Object.keys(marketPrices).length > 0 ? marketPrices : null;
    return [
      { symbol: "BTC", price: prices?.BTC?.price || 0, change: prices?.BTC?.change || 0, volume: 28500000000, fundingRate: 0.012 },
      { symbol: "ETH", price: prices?.ETH?.price || 0, change: prices?.ETH?.change || 0, volume: 15200000000, fundingRate: 0.008 },
      { symbol: "BNB", price: prices?.BNB?.price || 0, change: prices?.BNB?.change || 0, volume: 1850000000, fundingRate: 0.005 },
      { symbol: "SOL", price: prices?.SOL?.price || 0, change: prices?.SOL?.change || 0, volume: 4200000000, fundingRate: 0.025 },
    ];
  };

  const marketData = getMarketData();
  const connectedCount = dataSources.filter((d) => d.status === "connected").length;
  const totalQuota = dataSources.reduce((sum, d) => sum + d.quota.total, 0);
  const usedQuota = dataSources.reduce((sum, d) => sum + d.quota.used, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据看板</h1>
          <p className="text-muted-foreground">
            多数据源接入状态 · 实时市场数据
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Wifi className="h-3 w-3 text-green-500" />
            {connectedCount}/{dataSources.length} 已连接
          </Badge>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新全部
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API配额使用</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((usedQuota / totalQuota) * 100).toFixed(0)}%</div>
            <Progress value={(usedQuota / totalQuota) * 100} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {usedQuota.toLocaleString()} / {totalQuota.toLocaleString()} 次
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">数据延迟</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32ms</div>
            <p className="text-xs text-muted-foreground">平均延迟</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">日交易量</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$51.2B</div>
            <p className="text-xs text-muted-foreground">24h BTC等价</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">数据源状态</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
            <div className="flex gap-1 mt-2">
              {dataSources.map((ds) => (
                <div
                  key={ds.id}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    ds.status === "connected" && "bg-green-500",
                    ds.status === "warning" && "bg-yellow-500",
                    ds.status === "error" && "bg-red-500"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            数据源状态
          </CardTitle>
          <CardDescription>
            所有已接入的免费数据源及API配额使用情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dataSources.map((source) => {
              const Icon = source.icon;
              const quotaPercent = (source.quota.used / source.quota.total) * 100;

              return (
                <div
                  key={source.id}
                  className={cn(
                    "rounded-lg border p-4 transition-all",
                    source.status === "warning" && "border-yellow-500 bg-yellow-500/5",
                    source.status === "connected" && "hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", source.color)}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{source.name}</p>
                        <p className="text-xs text-muted-foreground">{source.type}</p>
                      </div>
                    </div>
                    {source.status === "connected" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {source.status === "warning" && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    {source.status === "error" && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">延迟</span>
                      <span className="font-medium">{source.latency}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">配额</span>
                      <span className={quotaPercent > 80 ? "text-yellow-600" : ""}>
                        {source.quota.used}/{source.quota.total}
                      </span>
                    </div>
                    <Progress
                      value={quotaPercent}
                      className={cn(
                        "h-1",
                        quotaPercent > 90 && "[&>div]:bg-red-500",
                        quotaPercent > 70 && quotaPercent <= 90 && "[&>div]:bg-yellow-500",
                        quotaPercent <= 70 && "[&>div]:bg-green-500"
                      )}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {source.data.map((d) => (
                        <Badge key={d} variant="secondary" className="text-[10px]">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {source.apiKey && (
                    <Badge variant="outline" className="mt-3 w-full justify-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      API Key已配置
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Market Data & Indicators */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Market Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              市场数据
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>交易对</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>24h涨跌</TableHead>
                  <TableHead>24h成交量</TableHead>
                  <TableHead>资金费率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketData.map((market) => (
                  <TableRow key={market.symbol}>
                    <TableCell className="font-medium">{market.symbol}</TableCell>
                    <TableCell>${market.price.toFixed(4)}</TableCell>
                    <TableCell>
                      <span className={market.change >= 0 ? "text-green-600" : "text-red-600"}>
                        {market.change >= 0 ? "+" : ""}{market.change.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>${(market.volume / 1000000000).toFixed(1)}B</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          market.fundingRate > 0
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }
                      >
                        {market.fundingRate > 0 ? "+" : ""}{market.fundingRate.toFixed(3)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* On-chain Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              链上指标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {indicators.map((ind, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">{ind.name}</p>
                    <p className="text-xs text-muted-foreground">{ind.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{ind.value.toLocaleString()}</p>
                    <Badge
                      variant="secondary"
                      className={
                        ind.signal === "up"
                          ? "bg-green-500/10 text-green-600"
                          : ind.signal === "down"
                          ? "bg-red-500/10 text-red-600"
                          : "bg-blue-500/10 text-blue-600"
                      }
                    >
                      {ind.signal === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                      {ind.signal === "down" && <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                      {ind.signal === "normal" ? "正常" : ind.signal === "up" ? "上升" : "下降"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            技术指标库 (200+指标)
          </CardTitle>
          <CardDescription>
            CryptoIndicatorLib 全Numba JIT实现
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { category: "趋势指标", count: 28, examples: ["MA", "EMA", "SMA", "WMA"] },
              { category: "动量指标", count: 35, examples: ["RSI", "MACD", "Stochastic", "CCI"] },
              { category: "波动率指标", count: 18, examples: ["ATR", "布林带", "KC", "Donchian"] },
              { category: "成交量指标", count: 22, examples: ["OBV", "VWAP", "ADL", "MFI"] },
              { category: "通道指标", count: 15, examples: ["轨道线", "包络线", "回归通道"] },
              { category: "画线工具", count: 25, examples: ["趋势线", "斐波那契", "Gann"] },
              { category: "K线形态", count: 42, examples: ["吞没", "锤子", "十字星"] },
              { category: "自定义指标", count: 15, examples: ["复合指标", "自定义公式"] },
            ].map((group, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{group.category}</span>
                  <Badge variant="secondary">{group.count}个</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.examples.map((ex) => (
                    <Badge key={ex} variant="outline" className="text-[10px]">
                      {ex}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
