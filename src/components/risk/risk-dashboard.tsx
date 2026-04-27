"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Shield,
  AlertTriangle,
  Zap,
  Lock,
  CheckCircle,
  XCircle,
  Activity,
  TrendingDown,
  Clock,
  Server,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fuseLevels = [
  {
    level: 1,
    name: "策略回撤熔断",
    threshold: 20,
    current: 8.5,
    status: "normal",
    action: "暂停策略",
    description: "策略级回撤超过20%时暂停",
    icon: TrendingDown,
    color: "blue",
  },
  {
    level: 2,
    name: "策略平仓熔断",
    threshold: 30,
    current: 8.5,
    status: "normal",
    action: "强制平仓",
    description: "策略级回撤超过30%时平仓",
    icon: XCircle,
    color: "yellow",
  },
  {
    level: 3,
    name: "单币亏损熔断",
    threshold: 5,
    current: 2.3,
    status: "normal",
    action: "暂停开仓",
    description: "单币亏损超过5%净值时暂停",
    icon: AlertTriangle,
    color: "orange",
  },
  {
    level: 4,
    name: "保证金预警",
    threshold: 85,
    current: 42,
    status: "normal",
    action: "只平不开",
    description: "保证金占用>85%时禁止开仓",
    icon: Lock,
    color: "red",
  },
  {
    level: 5,
    name: "组合回撤熔断",
    threshold: 15,
    current: 8.32,
    status: "normal",
    action: "清仓停机",
    description: "组合级回撤>15%时全部清仓",
    icon: Shield,
    color: "purple",
  },
];

const protectionModules = [
  { name: "资金费率自适应", status: "active", description: "预测费率>0.1%时降低多头权重" },
  { name: "ADL自动减仓监控", status: "active", description: "监控ADL灯，红色时降杠杆50%" },
  { name: "预言机三重校验", status: "active", description: "交叉验证Chainlink/Pyth/CEX" },
  { name: "假突破检测", status: "active", description: "突破需成交量>120%均量确认" },
  { name: "组合保证金模型", status: "active", description: "跨币种Delta/Gamma对销" },
  { name: "动态止损", status: "active", description: "ATR(14)*multiplier or 最高价回撤3%" },
];

const systemComponents = [
  { name: "DPDK订单网关", status: "healthy", latency: "45μs", uptime: "99.99%" },
  { name: "五级熔断器", status: "healthy", latency: "<1μs", uptime: "100%" },
  { name: "API保险库", status: "healthy", latency: "N/A", uptime: "100%" },
  { name: "硬件看门狗", status: "healthy", latency: "N/A", uptime: "99.95%" },
  { name: "预言机校验", status: "healthy", latency: "2ms", uptime: "99.90%" },
];

const alerts = [
  { time: "14:32", level: "info", message: "ETH资金费率上升至0.08%，已自动降低多头权重" },
  { time: "13:45", level: "success", message: "ADL灯转绿，多头仓位已解除" },
  { time: "12:20", level: "warning", message: "BTC波动率上升，波动率策略已自动降杠杆" },
  { time: "10:15", level: "success", message: "预言机偏差校验通过，偏差<0.5%" },
];

export function RiskDashboard() {
  const getAlertColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "warning":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "error":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">风控仪表盘</h1>
          <p className="text-muted-foreground">
            五级熔断防护 · 全链路风控监控
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
            <Shield className="h-3 w-3" />
            防护中
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            所有组件正常
          </Badge>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">保证金占用</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <Progress value={42} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              安全范围 (阈值85%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">组合回撤</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-8.32%</div>
            <Progress value={55} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              安全范围 (阈值15%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">VaR使用率</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              风险价值估算
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">杠杆率</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2x</div>
            <Progress value={32} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              当前使用杠杆
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Five-Level Fuses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            五级熔断器
          </CardTitle>
          <CardDescription>
            硬件级安全保障，层层递进的风险控制
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {fuseLevels.map((fuse) => {
              const Icon = fuse.icon;
              const percentage = (fuse.current / fuse.threshold) * 100;
              const isWarning = percentage > 70;
              const isCritical = percentage > 90;

              return (
                <div
                  key={fuse.level}
                  className={cn(
                    "relative rounded-lg border p-4 transition-all",
                    isCritical && "border-red-500 bg-red-500/5",
                    isWarning && !isCritical && "border-yellow-500 bg-yellow-500/5",
                    !isWarning && "border-border"
                  )}
                >
                  {/* Level Badge */}
                  <div className="absolute -top-3 left-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-bold",
                        fuse.color === "blue" && "border-blue-500 text-blue-600",
                        fuse.color === "yellow" && "border-yellow-500 text-yellow-600",
                        fuse.color === "orange" && "border-orange-500 text-orange-600",
                        fuse.color === "red" && "border-red-500 text-red-600",
                        fuse.color === "purple" && "border-purple-500 text-purple-600"
                      )}
                    >
                      L{fuse.level}
                    </Badge>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-3 mt-2">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center",
                        isCritical && "bg-red-500/20",
                        isWarning && !isCritical && "bg-yellow-500/20",
                        !isWarning && "bg-green-500/20"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isCritical && "text-red-500",
                          isWarning && !isCritical && "text-yellow-500",
                          !isWarning && "text-green-500"
                        )}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <h4 className="text-center font-medium text-sm mb-2">
                    {fuse.name}
                  </h4>

                  {/* Values */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">当前</span>
                      <span className="font-medium">
                        {fuse.current}
                        {fuse.threshold > 10 ? "%" : "%"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">阈值</span>
                      <span className="font-medium">{fuse.threshold}%</span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={cn(
                        "h-1.5",
                        isCritical && "[&>div]:bg-red-500",
                        isWarning && !isCritical && "[&>div]:bg-yellow-500",
                        !isWarning && "[&>div]:bg-green-500"
                      )}
                    />
                  </div>

                  {/* Status */}
                  <div className="mt-3 pt-3 border-t">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "w-full justify-center",
                        isCritical && "bg-red-500/20 text-red-600",
                        isWarning && !isCritical && "bg-yellow-500/20 text-yellow-600",
                        !isWarning && "bg-green-500/20 text-green-600"
                      )}
                    >
                      {isCritical ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          触发熔断
                        </>
                      ) : isWarning ? (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          预警中
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          正常
                        </>
                      )}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      {fuse.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Protection Modules & Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Protection Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              合约专项攻防
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {protectionModules.map((module, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{module.name}</p>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  运行中
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              最近告警
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={cn("flex items-start gap-3 p-3 rounded-lg border", getAlertColor(alert.level))}
              >
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        alert.level === "success" && "bg-green-500/20 text-green-600",
                        alert.level === "warning" && "bg-yellow-500/20 text-yellow-600",
                        alert.level === "info" && "bg-blue-500/20 text-blue-600"
                      )}
                    >
                      {alert.level === "success" && "成功"}
                      {alert.level === "warning" && "警告"}
                      {alert.level === "info" && "信息"}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            系统组件状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {systemComponents.map((component, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 text-center"
              >
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Server className="h-5 w-5 text-green-500" />
                </div>
                <p className="font-medium text-sm">{component.name}</p>
                <div className="mt-2 space-y-1">
                  {component.latency !== "N/A" && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">延迟</span>
                      <span className="font-medium text-green-600">{component.latency}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">可用</span>
                    <span className="font-medium text-green-600">{component.uptime}</span>
                  </div>
                </div>
                <Badge className="mt-3 bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  健康
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            紧急操作
          </CardTitle>
          <CardDescription>
            紧急情况下的人工干预措施
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              暂停所有策略
            </Button>
            <Button variant="outline" className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              平仓所有仓位
            </Button>
            <Button variant="destructive" className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              触发自杀开关
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
