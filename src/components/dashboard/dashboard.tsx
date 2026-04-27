"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  Clock,
  BarChart3,
  Brain,
  AlertTriangle,
  DollarSign,
  Database,
  ArrowUpRight,
  ArrowDownRight,
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

const systemComponents = [
  { name: "Coze平台", status: "online", desc: "智能编排层" },
  { name: "云端计算", status: "online", desc: "特征工厂+TFT模型" },
  { name: "本地执行", status: "online", desc: "五级熔断网关" },
  { name: "数据源", status: "online", desc: "8个数据源已连接" },
];

const alerts = [
  { time: "14:32", level: "warning", msg: "ETH保证金占用上升至78%" },
  { time: "13:15", level: "info", msg: "新策略通过PB检验准入" },
  { time: "10:45", level: "success", msg: "BTC-USDT顺势策略盈利+2.3%" },
  { time: "09:20", level: "info", msg: "HMM识别市场体制: 震荡" },
];

export function Dashboard() {
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header - 移动端优化 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">系统概览</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            实时监控量化交易系统运行状态
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs sm:text-sm">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="hidden xs:inline">系统运行中</span>
            <span className="xs:hidden">运行中</span>
          </Badge>
        </div>
      </div>

      {/* Key Metrics - 移动端单列/双列 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="col-span-1 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">总收益率</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-500">+12.45%</div>
            <p className="text-xs text-muted-foreground mt-1">
              本月 · 夏普 2.73
            </p>
            <Progress value={72} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">最大回撤</CardTitle>
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">-8.32%</div>
            <p className="text-xs text-muted-foreground mt-1">
              安全阈值内 (≤15%)
            </p>
            <Progress value={55} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">日交易量</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground mt-1">
              胜率 63.5%
            </p>
            <Progress value={65} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">风险状态</CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-500">低风险</div>
            <p className="text-xs text-muted-foreground mt-1">
              保证金 42%
            </p>
            <Progress value={42} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - 移动端堆叠 */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-7">
        {/* Performance Chart */}
        <Card className="lg:col-span-4">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              收益率曲线
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <ResponsiveContainer width="100%" height={200} className="hidden sm:block">
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
            {/* 移动端简化显示 */}
            <div className="sm:hidden flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground">当前净值</div>
                <div className="text-2xl font-bold">112.45</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">今日收益</div>
                <div className="text-xl font-bold text-green-500 flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4" /> +2.3%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
              策略分布
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={strategyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
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
            <div className="hidden sm:block grid grid-cols-2 gap-2 mt-2">
              {strategyDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - 移动端堆叠 */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <Database className="h-4 w-4 sm:h-5 sm:w-5" />
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
        <Card className="md:col-span-2 lg:col-span-1">
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
