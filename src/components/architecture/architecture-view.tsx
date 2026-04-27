"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Cloud,
  Server,
  Shield,
  Zap,
  Lock,
  Database,
  Brain,
  Activity,
  Code,
  Bell,
  Webhook,
  Cpu,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";


const cozeComponents = [
  { name: "自定义行情插件", desc: "Binance/OKX/Bybit WebSocket", icon: Webhook },
  { name: "代码节点", desc: "轻量指标计算 (RSI/布林带)", icon: Code },
  { name: "大模型节点", desc: "信号解读与早报生成", icon: Brain },
  { name: "定时触发器", desc: "Cron定时任务调度", icon: Bell },
  { name: "消息推送", desc: "微信/飞书/钉钉通知", icon: Bell },
];

const cloudComponents = [
  { name: "特征工厂", desc: "200+指标 Numba JIT", icon: Cpu },
  { name: "TFT元模型", desc: "Temporal Fusion Transformer", icon: Brain },
  { name: "PPO裁判", desc: "强化学习资金分配", icon: Activity },
  { name: "HMM体制识别", desc: "四态隐马尔可夫模型", icon: Layers },
  { name: "TDengine", desc: "时序数据库存储", icon: Database },
  { name: "回测引擎", desc: "C++事件驱动回测", icon: Server },
  { name: "压力测试", desc: "DDPM生成极端行情", icon: AlertTriangle },
];

const localComponents = [
  { name: "C++ DPDK网关", desc: "绑核+大页内存 <50μs", icon: Zap },
  { name: "五级熔断器", desc: "回撤/保证金/总风控", icon: Shield },
  { name: "API保险库", desc: "IP绑定+关闭提币", icon: Lock },
  { name: "硬件看门狗", desc: "异常自动断网", icon: HardDrive },
  { name: "预言机校验", desc: "Chainlink/Pyth/CEX", icon: CheckCircle },
];

export function ArchitectureView() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">三层混合架构</h1>
          <p className="text-muted-foreground">
            Coze调度 + 云端核心计算 + 本地安全执行
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          全链路正常
        </Badge>
      </div>

      {/* Architecture Diagram */}
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div className="relative">
            {/* Coze Layer */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">第一层: Coze 平台</h3>
                  <p className="text-sm text-muted-foreground">智能编排与交互层</p>
                </div>
                <Badge className="ml-auto bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                  只读权限
                </Badge>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {cozeComponents.map((comp) => {
                  const Icon = comp.icon;
                  return (
                    <div
                      key={comp.name}
                      className="rounded-lg border bg-card p-3 text-center hover:shadow-md transition-shadow"
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-xs font-medium">{comp.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {comp.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowRight className="h-5 w-5" />
                <span className="text-sm">只读数据 & 信号</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {/* Cloud Layer */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">第二层: 云端核心计算</h3>
                  <p className="text-sm text-muted-foreground">
                    Oracle Cloud 永久免费ARM实例
                  </p>
                </div>
                <Badge className="ml-auto bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  信号生成
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {cloudComponents.map((comp) => {
                  const Icon = comp.icon;
                  return (
                    <div
                      key={comp.name}
                      className="rounded-lg border bg-card p-3 text-center hover:shadow-md transition-shadow"
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-xs font-medium">{comp.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {comp.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowRight className="h-5 w-5" />
                <span className="text-sm">WireGuard加密隧道 (仅内网)</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {/* Local Layer */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">第三层: 本地安全执行</h3>
                  <p className="text-sm text-muted-foreground">
                    树莓派5/Intel N100迷你主机
                  </p>
                </div>
                <Badge className="ml-auto bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">
                  唯一下单入口
                </Badge>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {localComponents.map((comp) => {
                  const Icon = comp.icon;
                  return (
                    <div
                      key={comp.name}
                      className="rounded-lg border bg-card p-3 text-center hover:shadow-md transition-shadow"
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                      <p className="text-xs font-medium">{comp.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {comp.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-500" />
            权限边界与安全规则
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-blue-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Coze平台</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>仅可读取行情数据</li>
                <li>生成交易信号（不执行）</li>
                <li>发送通知告警</li>
                <li className="text-red-500">禁止开通交易权限</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-green-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4 text-green-500" />
                <span className="font-medium">云端核心</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>计算技术指标特征</li>
                <li>运行TFT/PPO模型</li>
                <li>生成回测报告</li>
                <li className="text-red-500">不直接发起订单</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-orange-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="font-medium">本地执行</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>唯一可发起实盘交易</li>
                <li>执行五级熔断风控</li>
                <li>管理API密钥</li>
                <li className="text-green-500">绑定IP+关闭提币</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            数据流向示意
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-2">
                <Database className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-medium">交易所API</p>
              <p className="text-xs text-muted-foreground">Binance/OKX/Bybit</p>
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-2">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-medium">云端处理</p>
              <p className="text-xs text-muted-foreground">特征计算+AI模型</p>
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-2">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-medium">本地执行</p>
              <p className="text-xs text-muted-foreground">风控+下单</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
