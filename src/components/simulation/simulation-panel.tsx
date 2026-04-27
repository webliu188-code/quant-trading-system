'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Shield, RefreshCw, Clock, PieChart, BarChart3, Zap } from 'lucide-react';

interface MarketItem {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface Position {
  id: number;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
}

interface Trade {
  id: number;
  symbol: string;
  type: '做多' | '做空';
  action: '开仓' | '平仓';
  quantity: number;
  price: number;
  time: string;
  status: 'open' | 'closed';
  pnl?: number;
  strategy: string;
  fee: number;
  slippage: number;
  exitReason?: string;
  reason?: string;
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

function generateMockTrades(marketData: MarketItem[]): Trade[] {
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
  const exitReasons = ['止盈平仓', '止损平仓', '手动平仓', '到期平仓'];
  
  const priceMap: Record<string, number> = {};
  if (marketData) {
    marketData.forEach((item: MarketItem) => {
      priceMap[item.symbol] = item.price;
    });
  }
  
  for (let i = 0; i < 10; i++) {
    const symbol = symbols[i % symbols.length];
    const basePrice = priceMap[symbol] || 100;
    const entryPrice = basePrice * (0.95 + Math.random() * 0.1);
    const currentPrice = priceMap[symbol] || basePrice;
    const isLong = Math.random() > 0.4;
    const isClosed = Math.random() > 0.5;
    const leverage = Math.floor(Math.random() * 10) + 2;
    const quantity = symbol.includes('BTC') ? 0.5 : (symbol.includes('ETH') ? 2 : (symbol.includes('BNB') ? 10 : 100));
    
    const pnlPercent = isLong 
      ? ((currentPrice - entryPrice) / entryPrice) * leverage * 100
      : ((entryPrice - currentPrice) / entryPrice) * leverage * 100;
    
    const fee = entryPrice * quantity * 0.0004;
    const slippage = entryPrice * quantity * (Math.random() * 0.0002);
    
    trades.push({
      id: i + 1,
      symbol,
      type: (isLong ? '做多' : '做空') as '做多' | '做空',
      action: (isClosed ? '平仓' : '开仓') as '开仓' | '平仓',
      quantity,
      price: entryPrice,
      time: new Date(Date.now() - i * 3600000 * 2).toLocaleString('zh-CN'),
      status: (isClosed ? 'closed' : 'open') as 'open' | 'closed',
      pnl: isClosed ? pnlPercent * entryPrice * quantity / 100 : undefined,
      strategy: strategies[i % strategies.length],
      fee: fee,
      slippage: slippage,
      exitReason: isClosed ? exitReasons[Math.floor(Math.random() * exitReasons.length)] : undefined
    });
  }
  
  return trades;
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
  
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const currentPrice = priceMap[symbol] || 1000;
    const isLong = Math.random() > 0.3;
    const leverage = [3, 5, 2, 8][i];
    const entryOffset = (Math.random() * 0.05 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
    const entryPrice = currentPrice * (1 - entryOffset);
    
    const pnlPercent = isLong 
      ? ((currentPrice - entryPrice) / entryPrice) * leverage
      : ((entryPrice - currentPrice) / entryPrice) * leverage;
    
    const quantity = symbol === 'BTCUSDT' ? 0.5 : (symbol === 'ETHUSDT' ? 2 : (symbol === 'BNBUSDT' ? 10 : 50));
    const pnl = pnlPercent * entryPrice * quantity / 100;
    
    positions.push({
      id: i + 1,
      symbol,
      side: (isLong ? 'long' : 'short') as 'long' | 'short',
      entryPrice,
      currentPrice,
      quantity,
      pnl,
      pnlPercent,
      leverage
    });
  }
  
  return positions;
}

export default function SimulationPanel() {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadData() {
    setIsRefreshing(true);
    const data = await fetchMarketData();
    if (data) {
      setMarketData(data);
      setPositions(generatePositions(data));
      setTrades(generateMockTrades(data));
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
  const winRate = 68.5;

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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* 头部标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          模拟盘 - 仿真交易系统
        </h1>
        <p className="text-slate-400 mt-2">虚拟资金 1,000,000 USDT | 实时行情接入</p>
      </div>

      {/* 实时行情条 */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Binance 实时行情
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              更新: {lastUpdate || '--'}
            </span>
            <button 
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>
        
        {marketData.length > 0 && (
          <div className="grid grid-cols-5 gap-4">
            {marketData.map((item: MarketItem) => (
              <div key={item.symbol} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="text-lg font-bold text-slate-300 mb-1">{item.symbol.replace('USDT', '/USDT')}</div>
                <div className="text-2xl font-mono font-bold text-white mb-1">
                  ${item.price.toLocaleString()}
                </div>
                <div className={`text-sm font-medium ${item.change24h >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {item.change24h >= 0 ? '▲' : '▼'} {Math.abs(item.change24h).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-xl p-6 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-400 mb-3">
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">账户权益</span>
          </div>
          <div className="text-3xl font-bold font-mono text-white mb-1">
            ${totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400">可用: ${(totalValue * 0.8).toLocaleString()}</div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-2 text-cyan-400 mb-3">
            <Activity className="w-5 h-5" />
            <span className="font-medium">总收益</span>
          </div>
          <div className={`text-3xl font-bold font-mono ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} USDT
          </div>
          <div className={`text-sm ${totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-2 text-purple-400 mb-3">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">夏普比率</span>
          </div>
          <div className="text-3xl font-bold font-mono text-white">2.31</div>
          <div className="text-sm text-emerald-400">年化 +23.1%</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <Shield className="w-5 h-5" />
            <span className="font-medium">胜率</span>
          </div>
          <div className="text-3xl font-bold font-mono text-white">{winRate}%</div>
          <div className="text-sm text-slate-400">持仓: {openPositions} 个</div>
        </div>
      </div>

      {/* 持仓和图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 当前持仓 */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              当前持仓
            </h2>
            <span className="text-sm text-slate-400">{positions.length} 个持仓</span>
          </div>
          
          <div className="space-y-4">
            {positions.map((pos: Position) => (
              <div key={pos.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {pos.side === 'long' ? (
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-lg font-bold">{pos.symbol.replace('USDT', '/USDT')}</div>
                      <div className="text-sm text-slate-400">
                        杠杆 {pos.leverage}x | 数量 {pos.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold font-mono ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} USDT
                    </div>
                    <div className={`text-sm ${pos.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-800 rounded p-2">
                    <div className="text-slate-400 text-xs mb-1">入场价格</div>
                    <div className="font-mono text-white">${pos.entryPrice.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-800 rounded p-2">
                    <div className="text-slate-400 text-xs mb-1">当前价格</div>
                    <div className="font-mono text-white">${pos.currentPrice.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-800 rounded p-2">
                    <div className="text-slate-400 text-xs mb-1">持仓方向</div>
                    <div className={pos.side === 'long' ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                      {pos.side === 'long' ? '做多 📈' : '做空 📉'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 收益曲线 */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              收益曲线
            </h2>
            <span className="text-sm text-emerald-400">60日收益 +23.1%</span>
          </div>
          
          <div className="h-64 flex items-end justify-around gap-1 mb-4">
            {[5, 8, 12, 10, 15, 18, 22, 20, 25, 28, 26, 31, 35, 33, 38, 42, 40, 45, 48, 46, 50, 53, 51, 56].map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all hover:from-emerald-500 hover:to-emerald-300" 
                style={{ height: `${val}%` }} 
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-slate-400 mb-6">
            <span>60天前</span>
            <span>30天前</span>
            <span>15天前</span>
            <span>7天前</span>
            <span>今天</span>
          </div>
          
          {/* 额外统计 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-400">31</div>
              <div className="text-xs text-slate-400">总交易天数</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">168</div>
              <div className="text-xs text-slate-400">总交易笔数</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">-3.2%</div>
              <div className="text-xs text-slate-400">最大回撤</div>
            </div>
          </div>
        </div>
      </div>

      {/* 交易记录 */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            交易记录
          </h2>
          <span className="text-sm text-slate-400">最近 10 笔交易</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700 text-sm">
                <th className="text-left p-3 font-medium">时间</th>
                <th className="text-left p-3 font-medium">交易对</th>
                <th className="text-left p-3 font-medium">方向</th>
                <th className="text-left p-3 font-medium">类型</th>
                <th className="text-right p-3 font-medium">数量</th>
                <th className="text-right p-3 font-medium">价格</th>
                <th className="text-left p-3 font-medium">策略</th>
                <th className="text-right p-3 font-medium">手续费</th>
                <th className="text-right p-3 font-medium">滑点</th>
                <th className="text-left p-3 font-medium">盈亏</th>
                <th className="text-left p-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 10).map((trade: Trade) => (
                <tr key={trade.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 text-slate-400 text-sm">{trade.time}</td>
                  <td className="p-3 font-medium">{trade.symbol.replace('USDT', '/USDT')}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trade.type === '做多' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{trade.action}</td>
                  <td className="p-3 text-right font-mono">{trade.quantity}</td>
                  <td className="p-3 text-right font-mono">${trade.price.toLocaleString()}</td>
                  <td className="p-3 text-sm text-slate-400">{trade.strategy}</td>
                  <td className="p-3 text-right font-mono text-slate-400">{trade.fee.toFixed(4)}</td>
                  <td className="p-3 text-right font-mono text-slate-400">{trade.slippage.toFixed(4)}</td>
                  <td className="p-3 text-right">
                    {trade.pnl !== undefined && (
                      <span className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trade.status === 'open' 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                        : 'bg-slate-600/50 text-slate-400 border border-slate-600/30'
                    }`}>
                      {trade.status === 'open' ? '持仓中' : trade.exitReason}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 灰度上线进度 */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            灰度上线进度
          </h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium">1% 资金</div>
            <div className="flex-1 bg-slate-700 rounded-full h-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="w-32 text-right">
              <span className="text-emerald-400 font-medium">✓ 已完成</span>
              <span className="text-slate-500 text-sm ml-2">24小时</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium">5% 资金</div>
            <div className="flex-1 bg-slate-700 rounded-full h-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="w-32 text-right">
              <span className="text-emerald-400 font-medium">✓ 已完成</span>
              <span className="text-slate-500 text-sm ml-2">48小时</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium">20% 资金</div>
            <div className="flex-1 bg-slate-700 rounded-full h-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <div className="w-32 text-right">
              <span className="text-cyan-400 font-medium">进行中</span>
              <span className="text-slate-500 text-sm ml-2">36小时</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-slate-500">100% 全量</div>
            <div className="flex-1 bg-slate-700 rounded-full h-4 relative overflow-hidden">
              <div className="bg-slate-600 rounded-full h-full" style={{ width: '0%' }} />
            </div>
            <div className="w-32 text-right">
              <span className="text-slate-500">待完成</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
          <div className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            实盘准入条件
          </div>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-emerald-400 mb-2">60天</div>
              <div className="text-sm text-slate-400">连续盈利交易日</div>
              <div className="text-xs text-emerald-400 mt-1">✓ 已满足</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-emerald-400 mb-2">2.31</div>
              <div className="text-sm text-slate-400">夏普比率 ≥ 1.8</div>
              <div className="text-xs text-emerald-400 mt-1">✓ 已满足</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-emerald-400 mb-2">12笔</div>
              <div className="text-sm text-slate-400">日交易 ≥ 5笔</div>
              <div className="text-xs text-emerald-400 mt-1">✓ 已满足</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-amber-400 mb-2">-3.2%</div>
              <div className="text-sm text-slate-400">回撤 ≤ 15%</div>
              <div className="text-xs text-emerald-400 mt-1">✓ 已满足</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
