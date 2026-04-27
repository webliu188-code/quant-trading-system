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
  ArrowUpRight,
  ArrowDownRight,
  Target,
  LineChart,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Strategy {
  id: string;
  name: string;
  type: "arbitrage" | "trend" | "momentum" | "volatility" | "market-making" | "multi-factor";
  leverage: "low" | "medium" | "high";
  leverageRange: string;
  signal: number;
  status: "active" | "paused" | "shadow";
  sharpe: number;
  pnl: number;
  weight: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  description: string;
  indicators: string[];
  timeframe: string;
  performance: string;
}

const strategies: Strategy[] = [
  // ===== 低杠杆套利策略 (2-3x) =====
  {
    id: "arb-1",
    name: "资金费率套利",
    type: "arbitrage",
    leverage: "low",
    leverageRange: "2-3x",
    signal: 0.72,
    status: "active",
    sharpe: 3.2,
    pnl: 8.5,
    weight: 0.12,
    maxDrawdown: 2.1,
    winRate: 89,
    trades: 1247,
    description: "利用期货与现货资金费率差异进行套利，当资金费率高于借贷成本时做多期货做空现货，资金费率结算时平仓。",
    indicators: ["资金费率", "借贷利率", "基差", "合约持仓量"],
    timeframe: "8H周期",
    performance: "年化8.5%，胜率89%，最大回撤2.1%",
  },
  {
    id: "arb-2",
    name: "跨期价差套利",
    type: "arbitrage",
    leverage: "low",
    leverageRange: "2-3x",
    signal: 0.45,
    status: "active",
    sharpe: 2.8,
    pnl: 5.2,
    weight: 0.08,
    maxDrawdown: 1.8,
    winRate: 76,
    trades: 856,
    description: "利用不同到期日期货合约价差进行统计套利，当价差偏离均值2σ时入场，回归时平仓。",
    indicators: ["价差", "布林带", "均值回归", "协整系数"],
    timeframe: "4H周期",
    performance: "年化5.2%，胜率76%，最大回撤1.8%",
  },
  {
    id: "arb-3",
    name: "三角套利",
    type: "arbitrage",
    leverage: "low",
    leverageRange: "2-3x",
    signal: 0.31,
    status: "active",
    sharpe: 2.5,
    pnl: 3.8,
    weight: 0.05,
    maxDrawdown: 1.2,
    winRate: 92,
    trades: 3421,
    description: "利用三个交易对之间的价格不平衡进行无风险套利，监测BTC/ETH、BTC/USDT、ETH/USDT三角价格偏差。",
    indicators: ["价格偏差", "交易深度", "手续费", "确认延迟"],
    timeframe: "1M周期",
    performance: "年化3.8%，胜率92%，最大回撤1.2%",
  },
  {
    id: "arb-4",
    name: "期现对冲",
    type: "arbitrage",
    leverage: "low",
    leverageRange: "2-3x",
    signal: 0.88,
    status: "active",
    sharpe: 3.5,
    pnl: 6.8,
    weight: 0.10,
    maxDrawdown: 1.5,
    winRate: 84,
    trades: 1089,
    description: "利用期货和现货的对冲关系，当基差扩大时入场，回归时平仓。自动再平衡保持Delta中性。",
    indicators: ["基差", "现货指数", "期货价格", "基差率"],
    timeframe: "1H周期",
    performance: "年化6.8%，胜率84%，最大回撤1.5%",
  },
  {
    id: "arb-5",
    name: "跨交易所价差",
    type: "arbitrage",
    leverage: "low",
    leverageRange: "2-3x",
    signal: 0.15,
    status: "shadow",
    sharpe: 1.9,
    pnl: 2.1,
    weight: 0.03,
    maxDrawdown: 0.9,
    winRate: 78,
    trades: 432,
    description: "监测Binance/OKX/Bybit交易所间价差，当利润覆盖手续费、滑点和提币时间成本时执行。",
    indicators: ["交易所价差", "提币时间", "充值确认", "手续费"],
    timeframe: "5M周期",
    performance: "年化2.1%，胜率78%，最大回撤0.9%",
  },

  // ===== 中杠杆趋势跟踪策略 (5-8x) =====
  {
    id: "trend-1",
    name: "MA均线交叉",
    type: "trend",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.65,
    status: "active",
    sharpe: 2.4,
    pnl: 12.3,
    weight: 0.15,
    maxDrawdown: 5.2,
    winRate: 42,
    trades: 234,
    description: "经典趋势跟踪策略，快线(MA10)上穿慢线(MA50)做多，下穿做空。配合ATR动态止损。",
    indicators: ["MA10", "MA50", "MA200", "ATR止损"],
    timeframe: "1H周期",
    performance: "年化12.3%，胜率42%，最大回撤5.2%",
  },
  {
    id: "trend-2",
    name: "MACD背离",
    type: "trend",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.78,
    status: "active",
    sharpe: 2.9,
    pnl: 9.2,
    weight: 0.12,
    maxDrawdown: 4.5,
    winRate: 48,
    trades: 189,
    description: "捕捉价格与MACD指标的底背离和顶背离信号进行逆势交易，需要2-3次背离确认。",
    indicators: ["MACD", "DIF", "DEA", "背离次数"],
    timeframe: "4H周期",
    performance: "年化9.2%，胜率48%，最大回撤4.5%",
  },
  {
    id: "trend-3",
    name: "布林带收口",
    type: "trend",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.55,
    status: "paused",
    sharpe: 2.1,
    pnl: 3.2,
    weight: 0.05,
    maxDrawdown: 2.9,
    winRate: 52,
    trades: 156,
    description: "布林带开口收窄超过80%后向上突破做多，向下突破做空。BandWidth指标筛选盘整区间。",
    indicators: ["布林带", "BandWidth", "突破确认", "成交量"],
    timeframe: "1H周期",
    performance: "年化3.2%，胜率52%，最大回撤2.9%",
  },
  {
    id: "trend-4",
    name: "趋势线突破",
    type: "trend",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.82,
    status: "active",
    sharpe: 2.6,
    pnl: 7.8,
    weight: 0.10,
    maxDrawdown: 4.1,
    winRate: 38,
    trades: 98,
    description: "价格有效突破趋势线后顺势交易，需配合成交量确认。突破幅度需超过趋势线价格3%。",
    indicators: ["趋势线", "成交量", "K线形态", "突破幅度"],
    timeframe: "4H周期",
    performance: "年化7.8%，胜率38%，最大回撤4.1%",
  },
  {
    id: "trend-5",
    name: "多周期共振",
    type: "trend",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.68,
    status: "active",
    sharpe: 2.7,
    pnl: 8.9,
    weight: 0.11,
    maxDrawdown: 4.8,
    winRate: 45,
    trades: 167,
    description: "日线、4H线、1H线三个周期趋势同向时入场。减少假信号，提高趋势确认度。",
    indicators: ["日线趋势", "4H趋势", "1H趋势", "共振系数"],
    timeframe: "多周期",
    performance: "年化8.9%，胜率45%，最大回撤4.8%",
  },
  {
    id: "trend-6",
    name: "海龟交易法则",
    type: "trend",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.71,
    status: "active",
    sharpe: 2.3,
    pnl: 10.1,
    weight: 0.09,
    maxDrawdown: 6.2,
    winRate: 32,
    trades: 78,
    description: "经典海龟交易系统，突破20日高低点入场，跌破10日高低点出场。N值仓位管理。",
    indicators: ["20日突破", "10日退出", "N值", "Unit Size"],
    timeframe: "日线",
    performance: "年化10.1%，胜率32%，最大回撤6.2%",
  },

  // ===== 动量策略 (5-8x) =====
  {
    id: "mom-1",
    name: "动量加速",
    type: "momentum",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.71,
    status: "active",
    sharpe: 2.2,
    pnl: 10.5,
    weight: 0.08,
    maxDrawdown: 5.8,
    winRate: 44,
    trades: 213,
    description: "追涨杀跌策略，当价格快速上涨且动量增强时做多。ROC指标结合加速度判断趋势强度。",
    indicators: ["ROC", "动量", "加速度", "价格变化率"],
    timeframe: "1H周期",
    performance: "年化10.5%，胜率44%，最大回撤5.8%",
  },
  {
    id: "mom-2",
    name: "成交量异常",
    type: "momentum",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.33,
    status: "active",
    sharpe: 1.7,
    pnl: 4.8,
    weight: 0.05,
    maxDrawdown: 3.2,
    winRate: 56,
    trades: 289,
    description: "监测成交量异常放大超过均量3倍，配合价格变动判断趋势延续性。放量突破准确率更高。",
    indicators: ["成交量", "均量", "量比", "价格变动"],
    timeframe: "1H周期",
    performance: "年化4.8%，胜率56%，最大回撤3.2%",
  },
  {
    id: "mom-3",
    name: "RSI超买超卖",
    type: "momentum",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: -0.42,
    status: "active",
    sharpe: 1.8,
    pnl: 4.5,
    weight: 0.07,
    maxDrawdown: 3.8,
    winRate: 58,
    trades: 345,
    description: "RSI低于30超卖区域反转时做多，高于70超买区域反转时做空。配合K线形态确认信号。",
    indicators: ["RSI(14)", "RSI(6)", "价格", "K线形态"],
    timeframe: "1H周期",
    performance: "年化4.5%，胜率58%，最大回撤3.8%",
  },

  // ===== 做市商策略 =====
  {
    id: "mm-1",
    name: "网格交易",
    type: "market-making",
    leverage: "low",
    leverageRange: "2-3x",
    signal: 0.52,
    status: "active",
    sharpe: 2.1,
    pnl: 5.8,
    weight: 0.06,
    maxDrawdown: 2.5,
    winRate: 72,
    trades: 2156,
    description: "在震荡行情中设置等间距网格，高卖低买。配合支撑压力位优化网格间距。",
    indicators: ["网格间距", "支撑位", "压力位", "波动率"],
    timeframe: "自动",
    performance: "年化5.8%，胜率72%，最大回撤2.5%",
  },
  {
    id: "mm-2",
    name: "VWAP剥头皮",
    type: "market-making",
    leverage: "medium",
    leverageRange: "3-5x",
    signal: 0.58,
    status: "active",
    sharpe: 2.4,
    pnl: 7.2,
    weight: 0.07,
    maxDrawdown: 3.1,
    winRate: 68,
    trades: 1567,
    description: "基于成交量加权平均价(VWAP)进行日内剥头皮，价格偏离VWAP时反向交易。",
    indicators: ["VWAP", "价格偏离", "成交量", "日内波动"],
    timeframe: "5M周期",
    performance: "年化7.2%，胜率68%，最大回撤3.1%",
  },

  // ===== 多因子策略 =====
  {
    id: "mf-1",
    name: "币种联动",
    type: "multi-factor",
    leverage: "medium",
    leverageRange: "3-5x",
    signal: 0.65,
    status: "active",
    sharpe: 2.5,
    pnl: 6.5,
    weight: 0.08,
    maxDrawdown: 3.5,
    winRate: 62,
    trades: 456,
    description: "监测BTC、ETH等主流币种联动性，当某一币种相对强弱变化时进行配对交易。",
    indicators: ["相关系数", "相对强弱", "Beta值", "协整性"],
    timeframe: "4H周期",
    performance: "年化6.5%，胜率62%，最大回撤3.5%",
  },
  {
    id: "mf-2",
    name: "资金流向",
    type: "multi-factor",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.48,
    status: "shadow",
    sharpe: 1.6,
    pnl: 3.2,
    weight: 0.04,
    maxDrawdown: 4.2,
    winRate: 54,
    trades: 234,
    description: "追踪链上资金流向和大户地址变化，判断机构建仓/减仓行为。",
    indicators: ["资金流入", "大户持仓", "交易所净流量", "链上转移"],
    timeframe: "日线",
    performance: "年化3.2%，胜率54%，最大回撤4.2%",
  },

  // ===== 高杠杆波动率策略 (10-15x) =====
  {
    id: "vol-1",
    name: "VIX恐慌抄底",
    type: "volatility",
    leverage: "high",
    leverageRange: "10-15x",
    signal: 0.92,
    status: "shadow",
    sharpe: 1.5,
    pnl: 2.8,
    weight: 0.02,
    maxDrawdown: 8.5,
    winRate: 28,
    trades: 45,
    description: "市场恐慌时VIX暴涨，价格超跌后分批建仓做多。VIX>30时开始布局，越跌越买。",
    indicators: ["VIX", "恐惧贪婪", "超跌指标", "布林带偏离"],
    timeframe: "日线",
    performance: "年化2.8%，胜率28%，最大回撤8.5%",
  },
  {
    id: "vol-2",
    name: "波动率收缩",
    type: "volatility",
    leverage: "high",
    leverageRange: "10-15x",
    signal: 0.25,
    status: "paused",
    sharpe: 1.2,
    pnl: 1.5,
    weight: 0.01,
    maxDrawdown: 6.2,
    winRate: 65,
    trades: 89,
    description: "波动率处于低位时做多波动率产品，波动率扩大时平仓。布林带收口时布局。",
    indicators: ["HV", "IV", "ATR", "布林带宽度"],
    timeframe: "周线",
    performance: "年化1.5%，胜率65%，最大回撤6.2%",
  },
  {
    id: "vol-3",
    name: "Gamma Scalping",
    type: "volatility",
    leverage: "high",
    leverageRange: "10-15x",
    signal: 0.58,
    status: "active",
    sharpe: 1.8,
    pnl: 5.2,
    weight: 0.03,
    maxDrawdown: 7.1,
    winRate: 58,
    trades: 156,
    description: "通过动态对冲从期权Gamma中获取收益。标的资产高抛低吸，收取时间价值。",
    indicators: ["Gamma", "Delta", "Theta", "标的价格"],
    timeframe: "日内",
    performance: "年化5.2%，胜率58%，最大回撤7.1%",
  },
  {
    id: "vol-4",
    name: "ATR跟踪止损",
    type: "volatility",
    leverage: "high",
    leverageRange: "8-12x",
    signal: 0.76,
    status: "active",
    sharpe: 2.0,
    pnl: 6.8,
    weight: 0.05,
    maxDrawdown: 5.5,
    winRate: 35,
    trades: 178,
    description: "基于ATR动态调整止损位，趋势行情中让利润奔跑。止损设置为ATR*2.5。",
    indicators: ["ATR(14)", "最高价", "最低价", "跟踪幅度"],
    timeframe: "1H周期",
    performance: "年化6.8%，胜率35%，最大回撤5.5%",
  },

  // ===== 经典理论策略 (基于道氏、维克多、缠论、Vegas) =====
  {
    id: "classic-1",
    name: "道氏理论趋势反转",
    type: "classic",
    leverage: "medium",
    leverageRange: "3-5x",
    signal: 0.68,
    status: "active",
    sharpe: 2.3,
    pnl: 8.9,
    weight: 0.10,
    maxDrawdown: 4.2,
    winRate: 45,
    trades: 234,
    description: "基于道氏理论识别HH(更高高点)/HL(更高低点)和LH/LL结构。趋势线破坏后发出反转预警。",
    indicators: ["HH/HL", "LH/LL", "趋势线", "支撑阻力"],
    timeframe: "4H/日线",
    performance: "年化8.9%，胜率45%，最大回撤4.2%",
  },
  {
    id: "classic-2",
    name: "维克多123/2B法则",
    type: "classic",
    leverage: "medium",
    leverageRange: "3-5x",
    signal: 0.75,
    status: "active",
    sharpe: 2.5,
    pnl: 7.8,
    weight: 0.11,
    maxDrawdown: 3.8,
    winRate: 52,
    trades: 189,
    description: "123法则：趋势线突破后，价格不创新高/低并反向突破关键位确认反转。2B法则：捕捉假突破，价格创短期新高/低后迅速收回。",
    indicators: ["趋势突破", "关键位", "假突破", "收盘确认"],
    timeframe: "4H周期",
    performance: "年化7.8%，胜率52%，最大回撤3.8%",
  },
  {
    id: "classic-3",
    name: "缠论分型+中枢",
    type: "classic",
    leverage: "medium",
    leverageRange: "3-5x",
    signal: 0.62,
    status: "shadow",
    sharpe: 2.1,
    pnl: 6.2,
    weight: 0.06,
    maxDrawdown: 4.5,
    winRate: 48,
    trades: 156,
    description: "识别顶分型(顶)和底分型(底)，处理K线包含关系。顶底分型构成笔，连续三笔重叠构成中枢。中枢震荡交易第三类买卖点。",
    indicators: ["顶分型", "底分型", "中枢", "背驰"],
    timeframe: "1H周期",
    performance: "年化6.2%，胜率48%，最大回撤4.5%",
  },
  {
    id: "classic-4",
    name: "Vegas双隧道趋势",
    type: "classic",
    leverage: "medium",
    leverageRange: "5-8x",
    signal: 0.72,
    status: "active",
    sharpe: 2.4,
    pnl: 9.5,
    weight: 0.09,
    maxDrawdown: 5.0,
    winRate: 42,
    trades: 198,
    description: "EMA144/169构成短期隧道，EMA576/676构成长期隧道。短期隧道上穿长期隧道且价格在短期隧道上方为强多头，回踩获支撑做多。",
    indicators: ["EMA144", "EMA169", "EMA576", "EMA676"],
    timeframe: "4H/日线",
    performance: "年化9.5%，胜率42%，最大回撤5.0%",
  },

  // ===== 机构辅助策略 =====
  {
    id: "inst-1",
    name: "ETF/巨鲸持股监控",
    type: "institutional",
    leverage: "low",
    leverageRange: "2-3x",
    signal: 0.58,
    status: "shadow",
    sharpe: 1.8,
    pnl: 4.2,
    weight: 0.04,
    maxDrawdown: 2.8,
    winRate: 62,
    trades: 89,
    description: "追踪'聪明钱'动向，监测ETF净流入/流出、巨鲸地址变化、机构建仓信号。大户转向时跟随操作。",
    indicators: ["ETF净流入", "巨鲸持仓", "机构地址", "链上转账"],
    timeframe: "日线",
    performance: "年化4.2%，胜率62%，最大回撤2.8%",
  },
  {
    id: "inst-2",
    name: "做市商概率交易",
    type: "institutional",
    leverage: "low",
    leverageRange: "1-2x",
    signal: 0.45,
    status: "active",
    sharpe: 3.0,
    pnl: 5.8,
    weight: 0.08,
    maxDrawdown: 1.5,
    winRate: 78,
    trades: 4567,
    description: "Delta中性双边报价策略，在订单簿双边同时挂单。赚取买卖价差收益，实时动态管理库存风险。",
    indicators: ["订单簿深度", "价差", "Delta", "库存风险"],
    timeframe: "1M周期",
    performance: "年化5.8%，胜率78%，最大回撤1.5%",
  },
];

const typeColors = {
  arbitrage: "bg-green-500/10 text-green-600 border-green-500/20",
  trend: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  momentum: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  volatility: "bg-red-500/10 text-red-600 border-red-500/20",
  "market-making": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "multi-factor": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  classic: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  institutional: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

const typeLabels = {
  arbitrage: "套利",
  trend: "趋势",
  momentum: "动量",
  volatility: "波动率",
  "market-making": "做市",
  "multi-factor": "多因子",
  classic: "经典理论",
  institutional: "机构辅助",
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
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(strategies.map((s) => [s.id, s.weight * 100]))
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
  const totalWeight = activeStrategies.reduce((sum, s) => sum + (weights[s.id] || 0) / 100, 0);
  const avgSharpe = activeStrategies.length > 0
    ? activeStrategies.reduce((sum, s) => sum + s.sharpe, 0) / activeStrategies.length
    : 0;
  const totalPnL = activeStrategies.reduce((sum, s) => sum + s.pnl, 0);
  const totalTrades = activeStrategies.reduce((sum, s) => sum + s.trades, 0);
  const avgWinRate = activeStrategies.length > 0
    ? activeStrategies.reduce((sum, s) => sum + s.winRate, 0) / activeStrategies.length
    : 0;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">策略分析</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {strategies.length}个异构原子策略集群 · AI交易员 · TFT元融合 + PPO裁判
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
        <Card className="p-2 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">激活策略</CardTitle>
            <Brain className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">{activeStrategies.length}</div>
            <p className="text-xs text-muted-foreground">/ {strategies.length} 总策略</p>
          </CardContent>
        </Card>

        <Card className="p-2 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">总权重</CardTitle>
            <Activity className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">{(totalWeight * 100).toFixed(0)}%</div>
            <Progress value={totalWeight * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="p-2 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">平均夏普</CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">{avgSharpe.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">风险调整收益</p>
          </CardContent>
        </Card>

        <Card className="p-2 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">累计收益</CardTitle>
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold text-green-600">+{totalPnL.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">年化收益率</p>
          </CardContent>
        </Card>

        <Card className="p-2 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">总交易次数</CardTitle>
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">{totalTrades.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">累计成交</p>
          </CardContent>
        </Card>

        <Card className="p-2 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-4">
            <CardTitle className="text-xs md:text-sm font-medium">平均胜率</CardTitle>
            <Target className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">{avgWinRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">盈利交易占比</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Distribution */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">策略类型分布</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(typeLabels).map(([type, label]) => {
              const count = strategies.filter((s) => s.type === type).length;
              const active = strategies.filter((s) => s.type === type && enabledStrategies.has(s.id)).length;
              return (
                <div
                  key={type}
                  className={cn(
                    "p-3 rounded-lg border text-center",
                    typeColors[type as keyof typeof typeColors]
                  )}
                >
                  <div className="text-lg font-bold">{active}/{count}</div>
                  <div className="text-xs opacity-80">{label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="all" className="text-xs px-3 py-1.5">全部 ({strategies.length})</TabsTrigger>
          <TabsTrigger value="active" className="text-xs px-3 py-1.5">实盘 ({strategies.filter(s => s.status === "active").length})</TabsTrigger>
          <TabsTrigger value="shadow" className="text-xs px-3 py-1.5">影子 ({strategies.filter(s => s.status === "shadow").length})</TabsTrigger>
          <TabsTrigger value="paused" className="text-xs px-3 py-1.5">暂停 ({strategies.filter(s => s.status === "paused").length})</TabsTrigger>
          <TabsTrigger value="arbitrage" className="text-xs px-3 py-1.5">套利</TabsTrigger>
          <TabsTrigger value="trend" className="text-xs px-3 py-1.5">趋势</TabsTrigger>
          <TabsTrigger value="momentum" className="text-xs px-3 py-1.5">动量</TabsTrigger>
          <TabsTrigger value="volatility" className="text-xs px-3 py-1.5">波动率</TabsTrigger>
          <TabsTrigger value="market-making" className="text-xs px-3 py-1.5">做市</TabsTrigger>
          <TabsTrigger value="multi-factor" className="text-xs px-3 py-1.5">多因子</TabsTrigger>
        </TabsList>

        {["all", "active", "shadow", "paused", "arbitrage", "trend", "momentum", "volatility", "market-making", "multi-factor"].map((tab) => {
          const filteredStrategies = tab === "all" ? strategies :
            tab === "active" ? strategies.filter(s => s.status === "active") :
            tab === "shadow" ? strategies.filter(s => s.status === "shadow") :
            tab === "paused" ? strategies.filter(s => s.status === "paused") :
            strategies.filter(s => s.type === tab);

          return (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStrategies.map((strategy) => {
                  const status = statusConfig[strategy.status];
                  const StatusIcon = status.icon;
                  return (
                    <Card
                      key={strategy.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        strategy.signal > 0 ? "border-green-500/20" : "border-red-500/20"
                      )}
                      onClick={() => setSelectedStrategy(strategy)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm truncate">{strategy.name}</h3>
                              <Badge className={cn("text-xs", typeColors[strategy.type])}>
                                {typeLabels[strategy.type]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={cn("text-xs", leverageColors[strategy.leverage])}>
                                {strategy.leverageRange}
                              </Badge>
                              <Badge className={cn("text-xs", status.color)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className={cn(
                              "text-lg font-bold",
                              strategy.signal > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {strategy.signal > 0 ? "+" : ""}{(strategy.signal * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground">信号强度</div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {strategy.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">夏普</div>
                            <div className="font-medium">{strategy.sharpe.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">收益</div>
                            <div className="font-medium text-green-600">+{strategy.pnl}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">权重</div>
                            <div className="font-medium">{(strategy.weight * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">胜率</div>
                            <div className="font-medium">{strategy.winRate}%</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{strategy.timeframe}</span>
                          </div>
                          <Switch
                            checked={enabledStrategies.has(strategy.id)}
                            onCheckedChange={() => toggleStrategy(strategy.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Strategy Detail Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStrategy(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="sticky top-0 bg-background z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{selectedStrategy.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={cn(typeColors[selectedStrategy.type])}>
                      {typeLabels[selectedStrategy.type]}
                    </Badge>
                    <Badge className={cn(leverageColors[selectedStrategy.leverage])}>
                      杠杆 {selectedStrategy.leverageRange}
                    </Badge>
                    <Badge className={cn(statusConfig[selectedStrategy.status].color)}>
                      {statusConfig[selectedStrategy.status].label}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedStrategy.timeframe}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedStrategy(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Signal Strength */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-red-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">信号强度</div>
                    <div className={cn(
                      "text-3xl font-bold",
                      selectedStrategy.signal > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {selectedStrategy.signal > 0 ? "+" : ""}{(selectedStrategy.signal * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedStrategy.signal > 0.5 ? "强势信号" : selectedStrategy.signal > 0 ? "偏多信号" : selectedStrategy.signal > -0.5 ? "偏空信号" : "强势做空信号"}
                    </div>
                  </div>
                  <div className="w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" opacity="0.2" />
                      <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke={selectedStrategy.signal > 0 ? "currentColor" : "currentColor"}
                        strokeWidth="10"
                        strokeLinecap="round"
                        className={selectedStrategy.signal > 0 ? "text-green-500" : "text-red-500"}
                        strokeDasharray={`${Math.abs(selectedStrategy.signal) * 283} 283`}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  策略说明
                </h4>
                <p className="text-sm text-muted-foreground">{selectedStrategy.description}</p>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  核心指标
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">年化收益</div>
                    <div className="text-lg font-bold text-green-600">+{selectedStrategy.pnl}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">夏普比率</div>
                    <div className="text-lg font-bold">{selectedStrategy.sharpe.toFixed(1)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">最大回撤</div>
                    <div className="text-lg font-bold text-red-600">-{selectedStrategy.maxDrawdown}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">胜率</div>
                    <div className="text-lg font-bold">{selectedStrategy.winRate}%</div>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">累计交易</div>
                  <div className="text-lg font-bold">{selectedStrategy.trades.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">策略权重</div>
                  <div className="text-lg font-bold">{(selectedStrategy.weight * 100).toFixed(1)}%</div>
                </div>
              </div>

              {/* Indicators */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  依赖指标
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStrategy.indicators.map((indicator) => (
                    <Badge key={indicator} variant="outline" className="text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Performance Description */}
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  历史表现
                </h4>
                <p className="text-sm">{selectedStrategy.performance}</p>
              </div>

              {/* Weight Adjustment */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  权重配置 ({weights[selectedStrategy.id]?.toFixed(0) || 0}%)
                </h4>
                <Slider
                  value={[weights[selectedStrategy.id] || selectedStrategy.weight * 100]}
                  min={0}
                  max={30}
                  step={1}
                  onValueChange={(value) => setWeights({ ...weights, [selectedStrategy.id]: value[0] })}
                  className="py-4"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant={selectedStrategy.signal > 0 ? "default" : "destructive"}
                  className="flex-1 gap-2"
                  onClick={() => toggleStrategy(selectedStrategy.id)}
                >
                  {enabledStrategies.has(selectedStrategy.id) ? (
                    <>
                      <Pause className="h-4 w-4" />
                      暂停策略
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      启用策略
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Settings className="h-4 w-4" />
                  参数配置
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
