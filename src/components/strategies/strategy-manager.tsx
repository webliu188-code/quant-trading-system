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
  X,
  ChevronRight,
  Zap,
  Shield,
  Clock,
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
  description?: string;
  indicators?: string[];
  performance?: string;
}

const strategies: Strategy[] = [
  // 低杠杆套利策略 (2-3x)
  { id: "arb-1", name: "资金费率套利", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.72, status: "active", sharpe: 3.2, pnl: 8.5, weight: 0.12, maxDrawdown: 2.1, description: "利用期货与现货资金费率差异进行套利，当资金费率高于借贷成本时做多期货做空现货。", indicators: ["资金费率", "借贷利率", "基差"] },
  { id: "arb-2", name: "跨期价差套利", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.45, status: "active", sharpe: 2.8, pnl: 5.2, weight: 0.08, maxDrawdown: 1.8, description: "利用不同到期日期货合约价差进行统计套利，当价差偏离均值时入场。", indicators: ["价差", "布林带", "均值回归"] },
  { id: "arb-3", name: "三角套利", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.31, status: "active", sharpe: 2.5, pnl: 3.8, weight: 0.05, maxDrawdown: 1.2, description: "利用三个交易对之间的价格不平衡进行无风险套利。", indicators: ["价格偏差", "交易深度", "手续费"] },
  { id: "arb-4", name: "跨交易所搬砖", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.15, status: "shadow", sharpe: 1.9, pnl: 2.1, weight: 0.03, maxDrawdown: 0.9, description: "监测不同交易所价差，当利润覆盖手续费和滑点时执行跨所搬砖。", indicators: ["交易所价差", "提币时间", "充值确认"] },
  { id: "arb-5", name: "期现对冲", type: "arbitrage", leverage: "low", leverageRange: "2-3x", signal: 0.88, status: "active", sharpe: 3.5, pnl: 6.8, weight: 0.10, maxDrawdown: 1.5, description: "利用期货和现货的对冲关系，当基差扩大时入场，回归时平仓。", indicators: ["基差", "现货指数", "期货价格"] },

  // 中杠杆趋势/动量策略 (5-8x)
  { id: "trend-1", name: "MA均线交叉", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: 0.65, status: "active", sharpe: 2.4, pnl: 12.3, weight: 0.15, maxDrawdown: 5.2, description: "经典趋势跟踪策略，快线上穿慢线做多，下穿做空。", indicators: ["MA5", "MA20", "MA60"] },
  { id: "trend-2", name: "RSI超买超卖", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: -0.42, status: "active", sharpe: 1.8, pnl: 4.5, weight: 0.08, maxDrawdown: 3.8, description: "RSI低于30超卖区域反转时做多，高于70超买区域反转时做空。", indicators: ["RSI(14)", "RSI(6)", "价格"] },
  { id: "trend-3", name: "MACD背离", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: 0.78, status: "active", sharpe: 2.9, pnl: 9.2, weight: 0.12, maxDrawdown: 4.5, description: "捕捉价格与MACD指标的底背离和顶背离信号进行逆势交易。", indicators: ["MACD", "DIF", "DEA"] },
  { id: "trend-4", name: "布林带收口", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: 0.55, status: "paused", sharpe: 2.1, pnl: 3.2, weight: 0.05, maxDrawdown: 2.9, description: "布林带开口收窄后向上突破做多，向下突破做空。", indicators: ["布林带", "BandWidth", "突破确认"] },
  { id: "trend-5", name: "趋势线突破", type: "trend", leverage: "medium", leverageRange: "5-8x", signal: 0.82, status: "active", sharpe: 2.6, pnl: 7.8, weight: 0.10, maxDrawdown: 4.1, description: "价格有效突破趋势线后顺势交易，需配合成交量确认。", indicators: ["趋势线", "成交量", "K线形态"] },

  // 动量策略
  { id: "mom-1", name: "动量加速", type: "momentum", leverage: "medium", leverageRange: "5-8x", signal: 0.71, status: "active", sharpe: 2.2, pnl: 10.5, weight: 0.08, maxDrawdown: 5.8, description: "追涨杀跌策略，当价格快速上涨且动量增强时做多。", indicators: ["ROC", "动量", "加速度"] },
  { id: "mom-2", name: "成交量异常", type: "momentum", leverage: "medium", leverageRange: "5-8x", signal: 0.33, status: "active", sharpe: 1.7, pnl: 4.8, weight: 0.05, maxDrawdown: 3.2, description: "监测成交量异常放大，配合价格变动判断趋势延续性。", indicators: ["成交量", "量比", "价格变动"] },

  // 高杠杆波动率策略 (10-15x)
  { id: "vol-1", name: "VIX恐慌抄底", type: "volatility", leverage: "high", leverageRange: "10-15x", signal: 0.92, status: "shadow", sharpe: 1.5, pnl: 2.8, weight: 0.02, maxDrawdown: 8.5, description: "市场恐慌时VIX暴涨，价格超跌后分批建仓做多。", indicators: ["VIX", "恐惧贪婪", "超跌指标"] },
  { id: "vol-2", name: "波动率收缩", type: "volatility", leverage: "high", leverageRange: "10-15x", signal: 0.25, status: "paused", sharpe: 1.2, pnl: 1.5, weight: 0.01, maxDrawdown: 6.2, description: "波动率处于低位时卖出期权或做多波动率产品。", indicators: ["HV", "IV", "ATR"] },
  { id: "vol-3", name: "Gamma Scalping", type: "volatility", leverage: "high", leverageRange: "10-15x", signal: 0.58, status: "active", sharpe: 1.8, pnl: 5.2, weight: 0.03, maxDrawdown: 7.1, description: "通过动态对冲从期权Gamma中获取收益。", indicators: ["Gamma", "Delta", "标的价格"] },
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

const statusConfig = {
  active: { label: "实盘中", color: "bg-green-500/10 text-green-600", icon: CheckCircle },
  paused: { label: "已暂停", color: "bg-amber-500/10 text-amber-600", icon: Pause },
  shadow: { label: "影子模式", color: "bg-purple-500/10 text-purple-600", icon: Eye },
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
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header - 移动端优化 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">策略分析</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            15个异构原子策略集群 · AI交易员
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <Brain className="h-3 w-3" />
            <span className="hidden sm:inline">TFT元融合:</span> 启用
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs">
            <Activity className="h-3 w-3" />
            <span className="hidden sm:inline">PPO裁判:</span> 运行中
          </Badge>
        </div>
      </div>

      {/* Summary Cards - 移动端2列 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card className="p-3 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">激活策略</CardTitle>
            <Brain className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{activeStrategies.length}/15</div>
            <Progress value={(activeStrategies.length / 15) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="p-3 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">资金权重</CardTitle>
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{(totalWeight * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground hidden sm:block">目标: 100%</p>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">平均夏普</CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">{avgSharpe.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">目标: ≥2.5</p>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">累计收益</CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-green-600">+{totalPnL.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground hidden sm:block">本月</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy List */}
      <Tabs defaultValue="all" className="space-y-3 md:space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 w-full">
          <TabsTrigger value="all" className="text-xs px-2 py-1 md:text-sm md:px-4 md:py-2">
            全部 ({strategies.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs px-2 py-1 md:text-sm md:px-4 md:py-2">
            激活 ({activeStrategies.length})
          </TabsTrigger>
          <TabsTrigger value="paused" className="text-xs px-2 py-1 md:text-sm md:px-4 md:py-2">
            暂停 ({strategies.filter((s) => s.status === "paused").length})
          </TabsTrigger>
          <TabsTrigger value="shadow" className="text-xs px-2 py-1 md:text-sm md:px-4 md:py-2">
            影子 ({strategies.filter((s) => s.status === "shadow").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          <StrategyGrid strategies={strategies} enabledStrategies={enabledStrategies} onToggle={toggleStrategy} onSelect={setSelectedStrategy} />
        </TabsContent>

        <TabsContent value="active" className="space-y-3">
          <StrategyGrid 
            strategies={strategies.filter((s) => enabledStrategies.has(s.id))} 
            enabledStrategies={new Set(strategies.filter((s) => enabledStrategies.has(s.id)).map(s => s.id))} 
            onToggle={toggleStrategy} 
            onSelect={setSelectedStrategy} 
          />
        </TabsContent>

        <TabsContent value="paused" className="space-y-3">
          <StrategyGrid 
            strategies={strategies.filter((s) => s.status === "paused")} 
            enabledStrategies={new Set()} 
            onToggle={toggleStrategy} 
            onSelect={setSelectedStrategy} 
          />
        </TabsContent>

        <TabsContent value="shadow" className="space-y-3">
          <StrategyGrid 
            strategies={strategies.filter((s) => s.status === "shadow")} 
            enabledStrategies={new Set()} 
            onToggle={toggleStrategy} 
            onSelect={setSelectedStrategy} 
          />
        </TabsContent>
      </Tabs>

      {/* Strategy Detail Modal */}
      {selectedStrategy && (
        <StrategyDetail
          strategy={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
          enabled={enabledStrategies.has(selectedStrategy.id)}
          onToggle={() => toggleStrategy(selectedStrategy.id)}
        />
      )}
    </div>
  );
}

function StrategyGrid({ 
  strategies, 
  enabledStrategies, 
  onToggle, 
  onSelect 
}: { 
  strategies: Strategy[]; 
  enabledStrategies: Set<string>; 
  onToggle: (id: string) => void; 
  onSelect: (s: Strategy) => void; 
}) {
  return (
    <div className="grid gap-2 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {strategies.map((strategy) => (
        <StrategyCard
          key={strategy.id}
          strategy={strategy}
          enabled={enabledStrategies.has(strategy.id)}
          onToggle={() => onToggle(strategy.id)}
          onSelect={() => onSelect(strategy)}
        />
      ))}
    </div>
  );
}

function StrategyCard({
  strategy,
  enabled,
  onToggle,
  onSelect,
}: {
  strategy: Strategy;
  enabled: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const signalColor = strategy.signal > 0 ? "text-green-500" : "text-red-500";
  const Icon = strategy.signal > 0 ? TrendingUp : TrendingDown;
  const StatusIcon = statusConfig[strategy.status].icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md p-3 md:p-4",
        !enabled && "opacity-60"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <Badge variant="outline" className={cn("text-[10px] md:text-xs px-1 md:px-2", typeColors[strategy.type])}>
              {typeLabels[strategy.type]}
            </Badge>
            <Badge className={cn("text-[10px] md:text-xs px-1 md:px-2", leverageColors[strategy.leverage])}>
              {strategy.leverageRange}
            </Badge>
          </div>
          <Switch 
            checked={enabled} 
            onCheckedChange={(checked) => {
              onToggle();
            }}
            onClick={(e) => e.stopPropagation()}
            className="scale-75 md:scale-100"
          />
        </div>
        <CardTitle className="text-sm md:text-base mt-2 flex items-center justify-between">
          <span>{strategy.name}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 md:space-y-3">
        {/* Signal */}
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-muted-foreground">信号强度</span>
          <div className="flex items-center gap-1 md:gap-2">
            <Icon className={cn("h-3 w-3 md:h-4 md:w-4", signalColor)} />
            <span className={cn("font-bold text-sm md:text-base", signalColor)}>
              {(strategy.signal * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Stats - 移动端紧凑 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 text-[10px] md:text-xs">
          <div className="flex justify-between md:flex-col md:items-start md:gap-1">
            <span className="text-muted-foreground">夏普</span>
            <span className="font-bold">{strategy.sharpe.toFixed(1)}</span>
          </div>
          <div className="flex justify-between md:flex-col md:items-start md:gap-1">
            <span className="text-muted-foreground">收益</span>
            <span className="font-bold text-green-600">+{strategy.pnl}%</span>
          </div>
          <div className="flex justify-between md:flex-col md:items-start md:gap-1">
            <span className="text-muted-foreground">权重</span>
            <span className="font-bold">{(strategy.weight * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between md:flex-col md:items-start md:gap-1">
            <span className="text-muted-foreground">回撤</span>
            <span className="font-bold text-red-600">-{strategy.maxDrawdown}%</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Badge variant="secondary" className={cn("gap-1 text-[10px] md:text-xs px-1 md:px-2 py-0.5", statusConfig[strategy.status].color)}>
            <StatusIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
            {statusConfig[strategy.status].label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function StrategyDetail({
  strategy,
  onClose,
  enabled,
  onToggle,
}: {
  strategy: Strategy;
  onClose: () => void;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
      <Card className="w-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto rounded-t-2xl md:rounded-2xl">
        <CardHeader className="sticky top-0 bg-background z-10 border-b pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl">{strategy.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={cn("text-xs", typeColors[strategy.type])}>
                  {typeLabels[strategy.type]}
                </Badge>
                <Badge className={cn("text-xs", leverageColors[strategy.leverage])}>
                  杠杆: {strategy.leverageRange}
                </Badge>
                <Badge variant="secondary" className={cn("gap-1 text-xs", statusConfig[strategy.status].color)}>
                  {statusConfig[strategy.status].label}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
          {/* Signal Gauge */}
          <div className="text-center py-4 md:py-6 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl">
            <div className="text-4xl md:text-5xl font-bold mb-2">
              <span className={strategy.signal > 0 ? "text-green-500" : "text-red-500"}>
                {(strategy.signal * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">当前信号强度</p>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-muted/30 rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-xl font-bold text-blue-600">{strategy.sharpe.toFixed(2)}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">夏普比率</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-xl font-bold text-green-600">+{strategy.pnl}%</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">累计收益</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-xl font-bold">{(strategy.weight * 100).toFixed(0)}%</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">资金权重</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-xl font-bold text-red-600">-{strategy.maxDrawdown}%</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">最大回撤</div>
            </div>
          </div>

          {/* Description */}
          {strategy.description && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                策略说明
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                {strategy.description}
              </p>
            </div>
          )}

          {/* Indicators */}
          {strategy.indicators && strategy.indicators.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                核心指标
              </h4>
              <div className="flex flex-wrap gap-2">
                {strategy.indicators.map((ind, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {ind}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Config */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              参数配置
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-3 w-3" /> 资金权重
                </label>
                <div className="flex items-center gap-2 md:gap-4 mt-2">
                  <Slider defaultValue={[strategy.weight * 100]} max={100} step={1} className="flex-1" />
                  <span className="text-sm w-12 text-right">{(strategy.weight * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">止损设置</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="number" defaultValue={strategy.maxDrawdown} className="text-sm" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">止盈设置</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="number" defaultValue={strategy.maxDrawdown * 2} className="text-sm" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button 
              variant={enabled ? "destructive" : "default"} 
              className="flex-1 sm:flex-none"
              onClick={onToggle}
            >
              {enabled ? (
                <>
                  <Pause className="h-4 w-4 mr-2" /> 暂停策略
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" /> 启用策略
                </>
              )}
            </Button>
            <Button className="flex-1" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              详细配置
            </Button>
            <Button className="flex-1">
              保存设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
