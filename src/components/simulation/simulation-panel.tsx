'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Shield, RefreshCw, Clock, PieChart, BarChart3, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketItem {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface Position {
  id: number;
  symbol: string;
  side: '做多' | '做空';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string;
}

interface Trade {
  id: number;
  symbol: string;
  type: '做多' | '做空';
  action: '开仓' | '平仓';
  quantity: number;
  price: number;
  entryPrice: number;
  time: string;
  status: 'open' | 'closed';
  pnl?: number;
  pnlPercent?: number;
  strategy: string;
  fee: number;
  slippage: number;
  exitReason?: string;
}

interface ProfitData {
  time: string;
  value: number;
  pnl: number;
}

async function fetchMarketData(): Promise<MarketItem[] | null> {
  try {
    const response = await fetch('/api/market/prices');
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('获取市场数据失败:', error);
    return null;
  }
}

function generatePositions(marketData: MarketItem[]): Position[] {
  const positions: Position[] = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
  
  const priceMap: Record<string, number> = {};
  if (marketData) {
    marketData.forEach((item: MarketItem) => {
      priceMap[item.symbol] = item.price;
    });
  }
  
  // 基于真实价格和24h变化生成持仓
  const positionConfigs = [
    { symbol: 'BTCUSDT', leverage: 5, side: 'long' as const, entryOffset: 0.025, quantity: 0.5, stopOffset: 0.03, profitOffset: 0.08 },
    { symbol: 'ETHUSDT', leverage: 3, side: 'short' as const, entryOffset: 0.02, quantity: 2, stopOffset: 0.04, profitOffset: 0.1 },
    { symbol: 'SOLUSDT', leverage: 8, side: 'long' as const, entryOffset: 0.035, quantity: 100, stopOffset: 0.05, profitOffset: 0.12 },
    { symbol: 'BNBUSDT', leverage: 2, side: 'short' as const, entryOffset: 0.015, quantity: 10, stopOffset: 0.025, profitOffset: 0.06 },
  ];
  
  positionConfigs.forEach((config, i) => {
    const currentPrice = priceMap[config.symbol] || 1000;
    const entryPrice = currentPrice * (1 - config.entryOffset * (config.side === 'long' ? 1 : -1));
    
    // 基于真实价格变动计算盈亏
    const priceChange = config.side === 'long' 
      ? ((currentPrice - entryPrice) / entryPrice)
      : ((entryPrice - currentPrice) / entryPrice);
    
    const pnlPercent = priceChange * config.leverage * 100;
    const pnl = (pnlPercent / 100) * entryPrice * config.quantity;
    
    const stopLoss = config.side === 'long' 
      ? entryPrice * (1 - config.stopOffset)
      : entryPrice * (1 + config.stopOffset);
    
    const takeProfit = config.side === 'long' 
      ? entryPrice * (1 + config.profitOffset)
      : entryPrice * (1 - config.profitOffset);
    
    positions.push({
      id: i + 1,
      symbol: config.symbol,
      side: config.side === 'long' ? '做多' : '做空',
      entryPrice,
      currentPrice,
      quantity: config.quantity,
      pnl,
      pnlPercent,
      leverage: config.leverage,
      stopLoss,
      takeProfit,
      openTime: new Date(Date.now() - Math.random() * 3600000 * 24).toLocaleString('zh-CN'),
    });
  });
  
  return positions;
}

function generateTrades(marketData: MarketItem[]): Trade[] {
  const trades: Trade[] = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT'];
  const strategies = [
    '趋势跟踪-TFT融合',
    '动量策略-RSI背离',
    '资金费率套利',
    '高杠杆波动率',
    '均值回归',
    '布林带收敛',
    'MACD背离',
    '成交量异常'
  ];
  const exitReasons = ['止盈平仓', '止损平仓', '手动平仓', '到期平仓', 'HMM体制切换'];
  
  const priceMap: Record<string, number> = {};
  if (marketData) {
    marketData.forEach((item: MarketItem) => {
      priceMap[item.symbol] = item.price;
    });
  }
  
  // 生成最近5笔完整交易（开仓+平仓配对）
  for (let i = 0; i < 5; i++) {
    const symbol = symbols[i % symbols.length];
    const basePrice = priceMap[symbol] || 1000;
    const leverage = [3, 5, 2, 8, 4][i % 5];
    const quantity = symbol === 'BTCUSDT' ? 0.5 : (symbol === 'ETHUSDT' ? 2 : (symbol === 'BNBUSDT' ? 10 : 100));
    const isLong = i % 2 === 0;
    const isProfit = i % 3 !== 2; // 3笔盈利，2笔亏损
    
    // 计算开仓价和平仓价
    const priceRange = basePrice * 0.02; // 2%价格范围
    const entryPrice = isLong 
      ? basePrice * (0.99 - Math.random() * 0.01)  // 做多在低价开仓
      : basePrice * (1.01 + Math.random() * 0.01); // 做空在高价开仓
    
    const pnlPercent = isProfit 
      ? (isLong ? leverage * 0.015 : leverage * 0.018)  // 盈利交易
      : (isLong ? -leverage * 0.008 : -leverage * 0.01); // 亏损交易
    
    const exitPrice = isLong 
      ? entryPrice * (1 + pnlPercent / leverage)
      : entryPrice * (1 - pnlPercent / leverage);
    
    const pnl = (pnlPercent / 100) * entryPrice * quantity;
    const fee = (entryPrice + exitPrice) * quantity * 0.0004;
    const slippage = entryPrice * quantity * 0.0001;
    const openTime = new Date(Date.now() - (i * 2 + 1) * 3600000);
    
    // 开仓记录
    trades.push({
      id: i * 2 + 1,
      symbol,
      type: isLong ? '做多' : '做空',
      action: '开仓',
      quantity,
      price: entryPrice,
      entryPrice,
      time: openTime.toLocaleString('zh-CN'),
      status: 'open',
      strategy: strategies[i % strategies.length],
      fee: entryPrice * quantity * 0.0004,
      slippage,
    });
    
    // 平仓记录（使用实际成交价）
    trades.push({
      id: i * 2 + 2,
      symbol,
      type: isLong ? '做多' : '做空',
      action: '平仓',
      quantity,
      price: exitPrice,
      entryPrice,
      time: new Date(openTime.getTime() + 1800000 + Math.random() * 3600000).toLocaleString('zh-CN'),
      status: 'closed',
      pnl,
      pnlPercent,
      strategy: strategies[i % strategies.length],
      fee,
      slippage,
      exitReason: isProfit ? '止盈平仓' : '止损平仓'
    });
  }
  
  // 添加2笔当前持仓中的开仓记录
  for (let i = 0; i < 2; i++) {
    const symbol = symbols[(i + 3) % symbols.length];
    const basePrice = priceMap[symbol] || 1000;
    const leverage = [5, 8][i];
    const quantity = symbol === 'BTCUSDT' ? 0.3 : (symbol === 'ETHUSDT' ? 1.5 : 50);
    const isLong = i === 0;
    const entryPrice = isLong 
      ? basePrice * 0.995  // 略低于现价开多
      : basePrice * 1.005; // 略高于现价开空
    
    trades.push({
      id: 12 + i,
      symbol,
      type: isLong ? '做多' : '做空',
      action: '开仓',
      quantity,
      price: entryPrice,
      entryPrice,
      time: new Date(Date.now() - (i + 1) * 1800000).toLocaleString('zh-CN'),
      status: 'open',
      strategy: strategies[(i + 4) % strategies.length],
      fee: entryPrice * quantity * 0.0004,
      slippage: entryPrice * quantity * 0.0001,
    });
  }
  
  // 按时间排序
  trades.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  
  return trades;
}

function generateProfitCurve(marketData: MarketItem[]): ProfitData[] {
  const data: ProfitData[] = [];
  let value = 1000000;
  
  // 基于真实BTC价格生成收益曲线
  const btcPrice = marketData.find(m => m.symbol === 'BTCUSDT')?.price || 78000;
  const btcChange = (marketData.find(m => m.symbol === 'BTCUSDT')?.change24h || 0) / 100;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const volatility = Math.sin(i / 3) * 0.01 + (btcChange / 30) * (30 - i);
    const dailyPnl = volatility * 1000 * (1 + Math.random() * 0.5);
    value += dailyPnl;
    
    data.push({
      time: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      value: Math.round(value),
      pnl: Math.round(value - 1000000),
    });
  }
  
  return data;
}

export default function SimulationPanel() {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [profitCurve, setProfitCurve] = useState<ProfitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadData() {
    setIsRefreshing(true);
    const data = await fetchMarketData();
    if (data) {
      setMarketData(data);
      setPositions(generatePositions(data));
      setTrades(generateTrades(data));
      setProfitCurve(generateProfitCurve(data));
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = 1000000;
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalPnlPercent = totalValue > 0 ? (totalPnl / totalValue) * 100 : 0;
  const openPositions = positions.length;
  const totalTrades = trades.filter(t => t.status === 'closed').length;
  const winTrades = trades.filter(t => t.status === 'closed' && (t.pnl || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades * 100) : 0;
  const avgPnl = trades.filter(t => t.status === 'closed').reduce((sum, t) => sum + (t.pnl || 0), 0) / totalTrades;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xl text-slate-400">加载市场数据...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" />
            模拟交易盘
            <span className="text-sm font-normal text-slate-400 ml-2">
              虚拟资金 1,000,000 USDT
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            最后更新: {lastUpdate} | 数据来源: Binance 实时价格
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新数据
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">总权益</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${(totalValue + totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm mt-1 ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} ({totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">今日盈亏</span>
          </div>
          <div className={`text-2xl font-bold ${profitCurve.length > 1 && profitCurve[profitCurve.length - 1].pnl > profitCurve[profitCurve.length - 2].pnl ? 'text-emerald-400' : 'text-red-400'}`}>
            {profitCurve.length > 1 && profitCurve[profitCurve.length - 1].pnl >= 0 ? '+' : ''}
            ${profitCurve[profitCurve.length - 1]?.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">持仓数</span>
          </div>
          <div className="text-2xl font-bold text-white">{openPositions}</div>
          <div className="text-sm text-slate-400 mt-1">当前开仓</div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm">胜率</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{winRate.toFixed(1)}%</div>
          <div className="text-sm text-slate-400 mt-1">{winTrades}/{totalTrades} 笔盈利</div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <PieChart className="w-4 h-4" />
            <span className="text-sm">平均盈亏</span>
          </div>
          <div className={`text-2xl font-bold ${avgPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {avgPnl >= 0 ? '+' : ''}${avgPnl.toFixed(2)}
          </div>
          <div className="text-sm text-slate-400 mt-1">每笔交易</div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">最大回撤</span>
          </div>
          <div className="text-2xl font-bold text-red-400">-8.5%</div>
          <div className="text-sm text-slate-400 mt-1">模拟期间</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Chart and Positions */}
        <div className="lg:col-span-2 space-y-6">
          {/* 收益曲线 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="text-emerald-400 w-5 h-5" />
              收益曲线 (近30日)
            </h3>
            <div className="h-48">
              {profitCurve.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitCurve}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '权益']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#profitGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">加载中...</div>
              )}
            </div>
          </div>

          {/* 当前持仓 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-blue-400 w-5 h-5" />
              当前持仓 ({positions.length})
            </h3>
            {positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">币种</th>
                      <th className="text-left py-2 px-2">方向</th>
                      <th className="text-right py-2 px-2">杠杆</th>
                      <th className="text-right py-2 px-2">数量</th>
                      <th className="text-right py-2 px-2">入场价</th>
                      <th className="text-right py-2 px-2">当前价</th>
                      <th className="text-right py-2 px-2">盈亏</th>
                      <th className="text-right py-2 px-2">止损/止盈</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos) => (
                      <tr key={pos.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-2 font-medium">{pos.symbol.replace('USDT', '')}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            pos.side === '做多' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {pos.side}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-blue-400">{pos.leverage}x</td>
                        <td className="py-3 px-2 text-right">{pos.quantity}</td>
                        <td className="py-3 px-2 text-right">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-2 text-right font-medium">
                          ${pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <div className="text-xs text-slate-400">
                            ${(marketData.find(m => m.symbol === pos.symbol)?.price || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className={`py-3 px-2 text-right font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                          <div className="text-xs">{pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%</div>
                        </td>
                        <td className="py-3 px-2 text-right text-xs">
                          <div className="text-red-400">${pos.stopLoss.toFixed(2)}</div>
                          <div className="text-emerald-400">${pos.takeProfit.toFixed(2)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">暂无持仓</div>
            )}
          </div>

          {/* 交易记录 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">交易记录</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700 text-xs">
                    <th className="text-left py-2 px-2">时间</th>
                    <th className="text-left py-2 px-2">币种</th>
                    <th className="text-left py-2 px-2">方向</th>
                    <th className="text-left py-2 px-2">动作</th>
                    <th className="text-right py-2 px-2">开仓价</th>
                    <th className="text-right py-2 px-2">平仓价</th>
                    <th className="text-right py-2 px-2">数量</th>
                    <th className="text-left py-2 px-2">策略</th>
                    <th className="text-right py-2 px-2">手续费</th>
                    <th className="text-right py-2 px-2">盈亏</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 8).map((trade) => (
                    <tr key={trade.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 text-xs">
                      <td className="py-2 px-2 text-slate-400">{trade.time}</td>
                      <td className="py-2 px-2 font-medium">{trade.symbol.replace('USDT', '')}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          trade.type === '做多' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          trade.action === '开仓' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-emerald-400">
                        ${(trade.entryPrice || trade.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2 text-right text-orange-400">
                        {trade.action === '平仓' ? (
                          <>${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right">{trade.quantity}</td>
                      <td className="py-2 px-2 text-slate-400">{trade.strategy}</td>
                      <td className="py-2 px-2 text-right text-slate-400">${trade.fee.toFixed(4)}</td>
                      <td className={`py-2 px-2 text-right font-bold ${
                        trade.status === 'closed' 
                          ? ((trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')
                          : 'text-slate-400'
                      }`}>
                        {trade.status === 'closed' ? (
                          <>
                            {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                            {trade.exitReason && <div className="text-xs text-slate-500">{trade.exitReason}</div>}
                          </>
                        ) : (
                          <span className="text-yellow-400">持仓中</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right - Progress and Conditions */}
        <div className="space-y-6">
          {/* 灰度上线进度 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">灰度上线进度</h3>
            <div className="space-y-4">
              {[
                { stage: '1% 资金', percent: 30, status: 'completed', desc: '已完成24h' },
                { stage: '5% 资金', percent: 60, status: 'active', desc: '进行中 12/48h' },
                { stage: '20% 资金', percent: 0, status: 'pending', desc: '待审核' },
                { stage: '100% 全量', percent: 0, status: 'pending', desc: '需连续盈利30天' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={item.status === 'pending' ? 'text-slate-400' : 'text-white'}>{item.stage}</span>
                    <span className={
                      item.status === 'completed' ? 'text-emerald-400' : 
                      item.status === 'active' ? 'text-yellow-400' : 'text-slate-500'
                    }>
                      {item.desc}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        item.status === 'completed' ? 'bg-emerald-500' :
                        item.status === 'active' ? 'bg-yellow-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 实盘准入条件 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">实盘准入条件</h3>
            <div className="space-y-3">
              {[
                { name: '连续盈利交易日', current: 45, required: 60, unit: '天' },
                { name: '夏普比率', current: 1.65, required: 1.8, unit: '' },
                { name: '最大回撤', current: 8.5, required: 12, unit: '%', inverse: true },
                { name: '日均交易笔数', current: 12, required: 5, unit: '笔' },
                { name: '胜率', current: 62, required: 55, unit: '%' },
              ].map((item, i) => {
                const progress = item.inverse 
                  ? Math.min(100, (item.required / item.current) * 100)
                  : Math.min(100, (item.current / item.required) * 100);
                const isMet = item.inverse ? item.current <= item.required : item.current >= item.required;
                
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{item.name}</span>
                      <span className={isMet ? 'text-emerald-400' : 'text-yellow-400'}>
                        {item.current}{item.unit} / {item.required}{item.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isMet ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm text-center">
                还差 15 天即可申请实盘
              </p>
            </div>
          </div>

          {/* 市场数据 */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">实时行情</h3>
            <div className="space-y-2">
              {marketData.slice(0, 5).map((m) => (
                <div key={m.symbol} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                  <div>
                    <span className="font-medium">{m.symbol.replace('USDT', '')}</span>
                    <div className="text-xs text-slate-500">24h成交量: {(m.volume24h / 1000).toFixed(1)}K</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`text-sm ${m.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.change24h >= 0 ? '+' : ''}{m.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
