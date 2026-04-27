"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Brain,
  Database,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const performanceData = [
  { time: "00:00", value: 100, drawdown: 0 },
  { time: "04:00", value: 102, drawdown: 0 },
  { time: "08:00", value: 101, drawdown: 1 },
  { time: "12:00", value: 105, drawdown: 0 },
  { time: "16:00", value: 108, drawdown: 0 },
  { time: "20:00", value: 106, drawdown: 2 },
  { time: "24:00", value: 112, drawdown: 0 },
];

const strategyDistribution = [
  { name: "趋势策略", value: 35, color: "#3b82f6" },
  { name: "套利策略", value: 25, color: "#10b981" },
  { name: "动量策略", value: 20, color: "#f59e0b" },
  { name: "波动率策略", value: 15, color: "#ef4444" },
  { name: "其他", value: 5, color: "#8b5cf6" },
];

const marketRegimes = [
  { label: "震荡", count: 42, color: "bg-yellow-500" },
  { label: "上涨趋势", count: 31, color: "bg-green-500" },
  { label: "下跌趋势", count: 18, color: "bg-red-500" },
  { label: "高波动", count: 9, color: "bg-purple-500" },
];

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统概览</h1>
          <p className="text-muted-foreground">
            实时监控量化交易系统运行状态
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            系统运行中
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            最后更新: 刚刚
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总收益率</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.45%</div>
            <p className="text-xs text-muted-foreground">
              本月 · 夏普比率 2.73
            </p>
            <Progress value={72} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">最大回撤</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-8.32%</div>
            <p className="text-xs text-muted-foreground">
              安全阈值内 (≤15%)
            </p>
            <Progress value={55} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">日交易量</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              胜率 63.5% · 盈亏比 1.82
            </p>
            <Progress value={65} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">风险状态</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">低风险</div>
            <p className="text-xs text-muted-foreground">
              保证金占用 42%
            </p>
            <Progress value={42} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Performance Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              收益率曲线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Strategy Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              策略分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={strategyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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
            <div className="grid grid-cols-2 gap-2 mt-4">
              {strategyDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Market Regime */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              市场体制识别
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketRegimes.map((regime) => (
                <div key={regime.label} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${regime.color}`} />
                  <span className="flex-1 text-sm">{regime.label}</span>
                  <span className="text-sm font-medium">{regime.count}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-center">
              <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                当前: 上涨趋势
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              系统健康状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Coze平台</span>
              </div>
              <Badge variant="outline">正常</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">云端计算</span>
              </div>
              <Badge variant="outline">正常</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">本地执行</span>
              </div>
              <Badge variant="outline">正常</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">数据通道</span>
              </div>
              <Badge variant="outline">正常</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              最近告警
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-2 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">资金费率异常</p>
                <p className="text-xs text-muted-foreground">BTC资金费率突增</p>
              </div>
              <span className="text-xs text-muted-foreground">5分钟前</span>
            </div>
            <div className="flex items-start gap-3 p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">策略切换</p>
                <p className="text-xs text-muted-foreground">ETH趋势策略激活</p>
              </div>
              <span className="text-xs text-muted-foreground">15分钟前</span>
            </div>
            <div className="flex items-start gap-3 p-2 rounded-lg bg-blue-500/10">
              <DollarSign className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">盈利结算</p>
                <p className="text-xs text-muted-foreground">BTC套利 +0.32%</p>
              </div>
              <span className="text-xs text-muted-foreground">1小时前</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
