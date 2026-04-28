"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  CheckCircle,
  Clock,
  BarChart3,
  Brain,
  AlertTriangle,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface MarketPrice {
  symbol: string;
  price: number;
  changePercent: number;
}

export function Dashboard() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 获取实时市场数据
  const fetchPrices = async () => {
    try {
      const res = await fetch("/api/market/prices");
      const data = await res.json();
      
      if (data.success && data.data) {
        const priceList: MarketPrice[] = data.data.map((item: any) => ({
          symbol: item.symbol,
          price: parseFloat(item.price),
          changePercent: parseFloat(item.change24h || item.changePercent || 0),
        }));
        setPrices(priceList);
        setLastUpdate(new Date().toLocaleTimeString("zh-CN"));
      }
    } catch (error) {
      console.error("获取价格失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // 获取主要币种价格
  const btcPrice = prices.find((p) => p.symbol === "BTC")?.price || 0;
  const btcChange = prices.find((p) => p.symbol === "BTC")?.changePercent || 0;
  const ethPrice = prices.find((p) => p.symbol === "ETH")?.price || 0;
  const ethChange = prices.find((p) => p.symbol === "ETH")?.changePercent || 0;

  // 模拟数据
  const systemHealth = 98.7;
  const activeStrategies = 24;
  const totalSignals = 156;
  const dailyProfit = 3.24;
  const maxDrawdown = -8.5;
  const sharpeRatio = 2.8;
  const winRate = 67.3;

  const strategyDistribution = [
    { name: "套利", value: 25, color: "#22c55e" },
    { name: "趋势", value: 22, color: "#3b82f6" },
    { name: "动量", value: 15, color: "#f97316" },
    { name: "波动率", value: 13, color: "#ef4444" },
    { name: "做市", value: 10, color: "#a855f7" },
    { name: "多因子", value: 8, color: "#06b6d4" },
    { name: "经典理论", value: 4, color: "#6366f1" },
    { name: "机构辅助", value: 3, color: "#ec4899" },
  ];

  const marketRegimes = [
    { label: "震荡", count: 45, color: "bg-yellow-500" },
    { label: "上涨趋势", count: 30, color: "bg-green-500" },
    { label: "下跌趋势", count: 15, color: "bg-red-500" },
    { label: "高波动", count: 10, color: "bg-purple-500" },
  ];

  const systemComponents = [
    { name: "Coze平台", desc: "智能编排层" },
    { name: "云端计算", desc: "TFT/PPO推理" },
    { name: "本地执行", desc: "风控网关" },
    { name: "数据源", desc: "8个数据源" },
  ];

  const alerts = [
    { time: "14:32", msg: "BTC突破$77000阻力位，趋势策略信号增强" },
    { time: "13:15", msg: "ETH资金费率上升至0.05%，注意多头风险" },
    { time: "11:48", msg: "模拟盘连续第45天盈利，胜率67.3%" },
    { time: "10:20", msg: "波动率指数下降，适宜趋势策略" },
  ];

  const performanceData = [
    { day: "Mon", value: 0.8 },
    { day: "Tue", value: 1.2 },
    { day: "Wed", value: -0.3 },
    { day: "Thu", value: 0.9 },
    { day: "Fri", value: 1.5 },
    { day: "Sat", value: 0.6 },
    { day: "Sun", value: -0.2 },
  ];

  const maxValue = Math.max(...performanceData.map((d) => Math.abs(d.value)));

  return (
    <div className="space-y-4">
      {/* 实时市场数据 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {loading ? (
          <Card className="col-span-full p-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">加载市场数据...</span>
            </div>
          </Card>
        ) : (
          prices.slice(0, 5).map((coin) => (
            <Card key={coin.symbol} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-semibold">{coin.symbol}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      coin.changePercent >= 0
                        ? "text-green-500 border-green-500"
                        : "text-red-500 border-red-500"
                    }`}
                  >
                    {coin.changePercent >= 0 ? "+" : ""}
                    {coin.changePercent.toFixed(2)}%
                  </Badge>
                </div>
                <div className="text-sm sm:text-base font-bold">
                  ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 最后更新时间 */}
      {lastUpdate && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>数据更新时间: {lastUpdate}</span>
          <span className="ml-auto text-green-500">Binance 实时</span>
        </div>
      )}

      {/* 性能指标 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              日收益率
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-500">
              +{dailyProfit}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">模拟盘日收益</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              最大回撤
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-red-500">
              {maxDrawdown}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">组合级回撤</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              夏普比率
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">
              {sharpeRatio}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">样本外年化</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              胜率
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-purple-500">
              {winRate}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">策略胜率</div>
          </CardContent>
        </Card>
      </div>

      {/* 收益曲线和策略分布 */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              本周收益曲线
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="flex items-end justify-around h-32 sm:h-40 gap-1">
              {performanceData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex items-end justify-center flex-1">
                    <div
                      className={`w-6 sm:w-8 rounded-t ${
                        item.value >= 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{
                        height: `${Math.abs(item.value) / maxValue * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{item.day}</div>
                  <div className={`text-xs font-medium ${item.value >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {item.value >= 0 ? "+" : ""}{item.value}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategy Distribution */}
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
              策略分布
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={strategyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {strategyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {strategyDistribution.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Market Regime */}
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              市场体制识别
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2">
              {marketRegimes.map((regime) => (
                <div key={regime.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${regime.color}`} />
                    <span className="text-xs sm:text-sm">{regime.label}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">{regime.count}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
              <span className="text-muted-foreground">当前体制: </span>
              <Badge variant="outline" className="ml-1 text-xs">震荡</Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              系统组件状态
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2">
              {systemComponents.map((comp) => (
                <div key={comp.name} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-medium">{comp.name}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{comp.desc}</div>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500 text-xs">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                    在线
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              最近告警
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Clock className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-muted-foreground">{alert.time}</div>
                    <div className="truncate">{alert.msg}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
