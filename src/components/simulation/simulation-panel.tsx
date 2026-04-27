"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlayCircle,
  Pause,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  BarChart3,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  RotateCw,
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
} from "recharts";

const performanceData = [
  { day: "Day 1", value: 100000, drawdown: 0 },
  { day: "Day 5", value: 102500, drawdown: 0.5 },
  { day: "Day 10", value: 101800, drawdown: 1.2 },
  { day: "Day 15", value: 105200, drawdown: 0 },
  { day: "Day 20", value: 108500, drawdown: 0 },
  { day: "Day 25", value: 106800, drawdown: 1.8 },
  { day: "Day 30", value: 112000, drawdown: 0 },
  { day: "Day 35", value: 115500, drawdown: 0 },
  { day: "Day 40", value: 118200, drawdown: 0 },
  { day: "Day 45", value: 116500, drawdown: 1.5 },
  { day: "Day 50", value: 120800, drawdown: 0 },
  { day: "Day 55", value: 123500, drawdown: 0 },
  { day: "Day 60", value: 128000, drawdown: 0 },
];

const positions = [
  { id: 1, symbol: "BTCUSDT", side: "long", entryPrice: 64500, currentPrice: 65200, quantity: 0.5, pnl: 350, pnlPercent: 1.08, leverage: 3 },
  { id: 2, symbol: "ETHUSDT", side: "long", entryPrice: 3450, currentPrice: 3480, quantity: 2, pnl: 60, pnlPercent: 0.87, leverage: 5 },
  { id: 3, symbol: "BNBUSDT", side: "short", entryPrice: 580, currentPrice: 575, quantity: 10, pnl: 50, pnlPercent: 0.86, leverage: 2 },
  { id: 4, symbol: "SOLUSDT", side: "long", entryPrice: 145, currentPrice: 142, quantity: 50, pnl: -150, pnlPercent: -2.07, leverage: 8 },
];

const trades = [
  { 
    id: 1, 
    symbol: "BTCUSDT", 
    type: "做多", 
    action: "开仓",
    quantity: 0.5, 
    price: 64500, 
    time: "2026-04-27 10:30:15", 
    status: "open",
    strategy: "趋势跟踪-TFT融合",
    fee: 16.13,
    slippage: 0.02
  },
  { 
    id: 2, 
    symbol: "ETHUSDT", 
    type: "做多", 
    action: "开仓",
    quantity: 2, 
    price: 3450, 
    time: "2026-04-27 10:25:42", 
    status: "open",
    strategy: "动量策略-RSI背离",
    fee: 6.90,
    slippage: 0.01
  },
  { 
    id: 3, 
    symbol: "BNBUSDT", 
    type: "做空", 
    action: "开仓",
    quantity: 10, 
    price: 580, 
    time: "2026-04-27 10:18:33", 
    status: "open",
    strategy: "资金费率套利",
    fee: 5.80,
    slippage: 0.01
  },
  { 
    id: 4, 
    symbol: "XRPUSDT", 
    type: "做多", 
    action: "平仓",
    quantity: 100, 
    price: 0.52, 
    time: "2026-04-27 09:45:20", 
    status: "closed", 
    pnl: 25,
    strategy: "波动率策略",
    fee: 0.26,
    slippage: 0.001,
    exitReason: "止盈"
  },
  { 
    id: 5, 
    symbol: "SOLUSDT", 
    type: "做多", 
    action: "开仓",
    quantity: 50, 
    price: 145, 
    time: "2026-04-27 09:30:00", 
    status: "open",
    strategy: "高杠杆波动率",
    fee: 36.25,
    slippage: 0.05
  },
  { 
    id: 6, 
    symbol: "ADAUSDT", 
    type: "做空", 
    action: "平仓",
    quantity: 500, 
    price: 0.45, 
    time: "2026-04-27 09:15:45", 
    status: "closed", 
    pnl: -15,
    strategy: "均值回归",
    fee: 1.13,
    slippage: 0.002,
    exitReason: "止损"
  },
  { 
    id: 7, 
    symbol: "BTCUSDT", 
    type: "做空", 
    action: "平仓",
    quantity: 0.3, 
    price: 66200, 
    time: "2026-04-26 22:15:33", 
    status: "closed", 
    pnl: 510,
    strategy: "趋势跟踪-TFT融合",
    fee: 9.93,
    slippage: 0.03,
    exitReason: "止盈"
  },
  { 
    id: 8, 
    symbol: "DOGEUSDT", 
    type: "做多", 
    action: "开仓",
    quantity: 5000, 
    price: 0.125, 
    time: "2026-04-26 18:45:12", 
    status: "open",
    strategy: "社交情绪-LunarCrush",
    fee: 3.13,
    slippage: 0.001
  },
];

const grayscaleProgress = [
  { phase: "1%资金", percent: 100, duration: "24h", status: "completed" },
  { phase: "5%资金", percent: 100, duration: "48h", status: "completed" },
  { phase: "20%资金", percent: 100, duration: "72h", status: "completed" },
  { phase: "全量资金", percent: 0, duration: "持续", status: "pending" },
];

export function SimulationPanel() {
  const [isRunning, setIsRunning] = useState(true);

  const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
  const winRate = 63.5;
  const tradingDays = 60;
  const sharpeRatio = 2.1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仿真模拟盘</h1>
          <p className="text-muted-foreground">
            虚拟资金100万U · 完整复制生产环境
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isRunning ? (
            <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
              <PlayCircle className="h-3 w-3" />
              运行中
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Pause className="h-3 w-3" />
              已暂停
            </Badge>
          )}
          <Button
            variant={isRunning ? "outline" : "default"}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                暂停模拟
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                启动模拟
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总收益</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$28,000</div>
            <p className="text-xs text-muted-foreground">+28.00%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">夏普比率</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharpeRatio.toFixed(2)}</div>
            <Progress value={(sharpeRatio / 2.5) * 100} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">目标: ≥1.8 ✓</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">交易天数</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tradingDays}</div>
            <Progress value={(tradingDays / 60) * 100} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">目标: ≥60天 ✓</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">胜率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <p className="text-xs text-muted-foreground">盈亏比 1.82</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">当前持仓</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">
              总盈亏: <span className={totalPnL >= 0 ? "text-green-600" : "text-red-600"}>{totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grayscale Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCw className="h-5 w-5" />
            灰度上线进度
          </CardTitle>
          <CardDescription>
            从模拟盘到实盘的渐进式资金开放流程
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {grayscaleProgress.map((phase, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg border p-4 text-center",
                  phase.status === "completed" && "border-green-500 bg-green-500/5",
                  phase.status === "current" && "border-blue-500 bg-blue-500/5",
                  phase.status === "pending" && "border-muted"
                )}
              >
                <div className="flex justify-center mb-2">
                  {phase.status === "completed" && (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {phase.status === "current" && (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                      <Play className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {phase.status === "pending" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium">{phase.phase}</p>
                <p className="text-sm text-muted-foreground">{phase.duration}</p>
                {phase.status === "pending" && (
                  <Badge variant="secondary" className="mt-2">待执行</Badge>
                )}
                {phase.status === "completed" && (
                  <Badge className="mt-2 bg-green-500/10 text-green-600">已完成</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts and Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              收益曲线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorSimValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" domain={["auto", "auto"]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "资金"]} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSimValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Entry Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              实盘准入条件
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">连续60交易日</span>
                </div>
                <Badge className="bg-green-500/10 text-green-600">✓ 已满足</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">夏普比率 ≥ 1.8</span>
                </div>
                <Badge className="bg-green-500/10 text-green-600">✓ 当前 {sharpeRatio}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">日交易 &gt; 5笔</span>
                </div>
                <Badge className="bg-green-500/10 text-green-600">✓ 已满足</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">回撤 ≤ 预期1.2倍</span>
                </div>
                <Badge className="bg-green-500/10 text-green-600">✓ 已满足</Badge>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button className="w-full" disabled>
                <CheckCircle className="h-4 w-4 mr-2" />
                满足实盘条件 - 申请上线
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions and Trades */}
      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions">当前持仓 ({positions.length})</TabsTrigger>
          <TabsTrigger value="trades">交易记录 ({trades.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>交易对</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead>杠杆</TableHead>
                    <TableHead>入场价</TableHead>
                    <TableHead>当前价</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>浮动盈亏</TableHead>
                    <TableHead>收益率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.symbol}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={pos.side === "long" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}
                        >
                          {pos.side === "long" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          {pos.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{pos.leverage}x</TableCell>
                      <TableCell>${pos.entryPrice.toLocaleString()}</TableCell>
                      <TableCell>${pos.currentPrice.toLocaleString()}</TableCell>
                      <TableCell>{pos.quantity}</TableCell>
                      <TableCell className={pos.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                        {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
                      </TableCell>
                      <TableCell className={pos.pnlPercent >= 0 ? "text-green-600" : "text-red-600"}>
                        {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>交易对</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead>动作</TableHead>
                    <TableHead>策略</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead>手续费</TableHead>
                    <TableHead>滑点</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>盈亏</TableHead>
                    <TableHead>说明</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="text-muted-foreground text-xs">{trade.time}</TableCell>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            trade.type === "做多" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                          }
                        >
                          {trade.type === "做多" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          {trade.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          trade.action === "开仓" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                        }>
                          {trade.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate" title={trade.strategy}>
                        {trade.strategy}
                      </TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>${trade.price.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{trade.fee.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{trade.slippage}</TableCell>
                      <TableCell>
                        <Badge variant={trade.status === "open" ? "default" : "secondary"}>
                          {trade.status === "open" ? "持仓中" : "已平仓"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {trade.pnl !== undefined && (
                          <span className={trade.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                            {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {trade.exitReason && (
                          <Badge variant="outline" className={
                            trade.exitReason === "止盈" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                          }>
                            {trade.exitReason}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
