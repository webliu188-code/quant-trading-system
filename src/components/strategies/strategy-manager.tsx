"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Eye,
  Pause,
  Play,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Strategy {
  id: string;
  name: string;
  type: "trend" | "arbitrage" | "momentum" | "volatility";
  leverage: "low" | "medium" | "high";
  leverageRange: string;
  signal: number;
  status: "active" | "paused" | "shadow";
  sharpe: number;
  pnl: number;
  weight: number;
  maxDrawdown: number;
}

const strategies: Strategy[] = [
  // 低杠杆套利策略 (2-3x)
  { id: "arb-1", name: "资金费率套利", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.72, status: "active", sharpe: 3.2, pnl: 8.5, weight: 0.12, maxDrawdown: 2.1 },
  { id: "arb-2", name: "跨期价差套利", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.45, status: "active", sharpe: 2.8, pnl: 5.2, weight: 0.08, maxDrawdown: 1.8 },
  { id: "arb-3", name: "三角套利", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.31, status: "active", sharpe: 2.5, pnl: 3.8, weight: 0.05, maxDrawdown: 1.2 },
  { id: "arb-4", name: "跨交易所搬砖", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.15, status: "shadow", sharpe: 1.9, pnl: 2.1, weight: 0.03, maxDrawdown: 0.9 },
  { id: "arb-5", name: "期现对冲", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.88, status: "active", sharpe: 3.5, pnl: 6.8, weight: 0.10, maxDrawdown: 1.5 },

  // 中杠杆趋势/动量策略 (5-8x)
  { id: "trend-1", name: "MA均线交叉", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: 0.65, status: "active", sharpe: 2.4, pnl: 12.3, weight: 0.15, maxDrawdown: 5.2 },
  { id: "trend-2", name: "RSI超买超卖", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: -0.42, status: "active", sharpe: 1.8, pnl: 4.5, weight: 0.08, maxDrawdown: 3.8 },
  { id: "trend-3", name: "MACD背离", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: 0.78, status: "active", sharpe: 2.9, pnl: 9.2, weight: 0.12, maxDrawdown: 4.5 },
  { id: "trend-4", name: "布林带收口", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: 0.55, status: "paused", sharpe: 2.1, pnl: 3.2, weight: 0.05, maxDrawdown: 2.9 },
  { id: "trend-5", name: "趋势线突破", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: 0.82, status: "active", sharpe: 2.6, pnl: 7.8, weight: 0.10, maxDrawdown: 4.1 },

  // 动量策略
  { id: "mom-1", name: "动量加速", type: "momentum", leverage: "medium", leverageRange: "5-8x", signal: 0.71, status: "active", sharpe: 2.2, pnl: 10.5, weight: 0.08, maxDrawdown: 5.8 },
  { id: "mom-2", name: "成交量异常", type: "momentum", leverage: "medium", leverageRange: "5-8x", signal: 0.33, status: "active", sharpe: 1.7, pnl: 4.8, weight: 0.05, maxDrawdown: 3.2 },

  // 高杠杆波动率策略 (10-15x)
  { id: "vol-1", name: "VIX恐慌抄底", type: "volatility", leverage: "high", leverageRange: "10-15x", signal: 0.92, status: "shadow", sharpe: 1.5, pnl: 2.8, weight: 0.02, maxDrawdown: 8.5 },
  { id: "vol-2", name: "波动率收缩", type: "volatility", leverage: "high", leverageRange: "10-15x", signal: 0.25, status: "paused", sharpe: 1.2, pnl: 1.5, weight: 0.01, maxDrawdown: 6.2 },
  { id: "vol-3", name: "Gamma Scalping", type: "volatility", leverage: "high", leverageRange: "10-15x", signal: 0.58, status: "active", sharpe: 1.8, pnl: 5.2, weight: 0.03, maxDrawdown: 7.1 },
];

const typeColors = {
  arbitrage: "bg-green-500/10 text-green-600 border-green-500/20",
  trend: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  momentum: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  volatility: "bg-red-500/10 text-red-600 border-red-500/20",
};

const typeLabels = {
  arbitrage: "套利",
  trend: "趋势",
  momentum: "动量",
  volatility: "波动率",
};

const leverageColors = {
  low: "text-green-600 bg-green-500/10",
  medium: "text-amber-600 bg-amber-500/10",
  high: "text-red-600 bg-red-500/10",
};

export function StrategyManager() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [enabledStrategies, setEnabledStrategies] = useState<Set<string>>(
    new Set(strategies.filter((s) => s.status !== "paused").map((s) => s.id))
  );

  const toggleStrategy = (id: string) => {
    const newEnabled = new Set(enabledStrategies);
    if (newEnabled.has(id)) {
      newEnabled.delete(id);
    } else {
      newEnabled.add(id);
    }
    setEnabledStrategies(newEnabled);
  };

  const activeStrategies = strategies.filter((s) => enabledStrategies.has(s.id));
  const totalWeight = activeStrategies.reduce((sum, s) => sum + s.weight, 0);
  const avgSharpe = activeStrategies.length > 0 
    ? activeStrategies.reduce((sum, s) => sum + s.sharpe, 0) / activeStrategies.length 
    : 0;
  const totalPnL = activeStrategies.reduce((sum, s) => sum + s.pnl, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">策略管理</h1>
          <p className="text-muted-foreground">
            15个异构原子策略集群 · AI交易员
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            TFT元融合: 启用
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            PPO裁判: 运行中
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">激活策略</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStrategies.length}/15</div>
            <Progress value={(activeStrategies.length / 15) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">资金权重</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalWeight * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              目标: 100% · 当前: {(totalWeight * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">平均夏普</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSharpe.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">目标: ≥2.5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">累计收益</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalPnL.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">本月</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">全部 ({strategies.length})</TabsTrigger>
          <TabsTrigger value="active">激活 ({activeStrategies.length})</TabsTrigger>
          <TabsTrigger value="paused">暂停 ({strategies.filter((s) => s.status === "paused").length})</TabsTrigger>
          <TabsTrigger value="shadow">影子 ({strategies.filter((s) => s.status === "shadow").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                enabled={enabledStrategies.has(strategy.id)}
                onToggle={() => toggleStrategy(strategy.id)}
                onClick={() => setSelectedStrategy(strategy)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strategies
              .filter((s) => enabledStrategies.has(s.id))
              .map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  enabled={true}
                  onToggle={() => toggleStrategy(strategy.id)}
                  onClick={() => setSelectedStrategy(strategy)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strategies
              .filter((s) => s.status === "paused")
              .map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  enabled={false}
                  onToggle={() => toggleStrategy(strategy.id)}
                  onClick={() => setSelectedStrategy(strategy)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="shadow" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strategies
              .filter((s) => s.status === "shadow")
              .map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  enabled={false}
                  onToggle={() => toggleStrategy(strategy.id)}
                  onClick={() => setSelectedStrategy(strategy)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Strategy Detail Modal */}
      {selectedStrategy && (
        <StrategyDetail
          strategy={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
        />
      )}
    </div>
  );
}

function StrategyCard({
  strategy,
  enabled,
  onToggle,
  onClick,
}: {
  strategy: Strategy;
  enabled: boolean;
  onToggle: () => void;
  onClick: () => void;
}) {
  const signalColor = strategy.signal > 0 ? "text-green-500" : "text-red-500";
  const Icon = strategy.signal > 0 ? TrendingUp : TrendingDown;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        !enabled && "opacity-60"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={typeColors[strategy.type]}>
              {typeLabels[strategy.type]}
            </Badge>
            <Badge className={leverageColors[strategy.leverage]}>
              {strategy.leverageRange}
            </Badge>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
        <CardTitle className="text-base mt-2">{strategy.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Signal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">信号强度</span>
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", signalColor)} />
            <span className={cn("font-medium", signalColor)}>
              {(strategy.signal * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">夏普</span>
            <span className="font-medium">{strategy.sharpe.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">收益</span>
            <span className="font-medium text-green-600">+{strategy.pnl}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">权重</span>
            <span className="font-medium">{(strategy.weight * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">回撤</span>
            <span className="font-medium text-red-600">-{strategy.maxDrawdown}%</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {strategy.status === "active" && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 gap-1">
              <CheckCircle className="h-3 w-3" />
              实盘中
            </Badge>
          )}
          {strategy.status === "paused" && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 gap-1">
              <Pause className="h-3 w-3" />
              已暂停
            </Badge>
          )}
          {strategy.status === "shadow" && (
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 gap-1">
              <Eye className="h-3 w-3" />
              影子模式
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StrategyDetail({
  strategy,
  onClose,
}: {
  strategy: Strategy;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{strategy.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className={typeColors[strategy.type]}>
              {typeLabels[strategy.type]}
            </Badge>
            <Badge className={leverageColors[strategy.leverage]}>
              杠杆: {strategy.leverageRange}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Signal Gauge */}
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-2">
              <span className={strategy.signal > 0 ? "text-green-500" : "text-red-500"}>
                {(strategy.signal * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">当前信号强度</p>
          </div>

          {/* Config */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">资金权重</label>
              <div className="flex items-center gap-4 mt-2">
                <Slider defaultValue={[strategy.weight * 100]} max={100} step={1} className="flex-1" />
                <span className="text-sm w-12">{(strategy.weight * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">止损设置</label>
              <div className="flex items-center gap-2 mt-2">
                <Input type="number" defaultValue={strategy.maxDrawdown} className="w-24" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">止盈设置</label>
              <div className="flex items-center gap-2 mt-2">
                <Input type="number" defaultValue={strategy.maxDrawdown * 2} className="w-24" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              详细配置
            </Button>
            <Button className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
