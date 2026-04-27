'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Shield } from 'lucide-react';

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
}

// 获取实时市场数据
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

// 生成模拟交易记录
function generateMockTrades(marketData: MarketItem[]): Trade[] {
  const trades = [];
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
  const exitReasons = ['止盈', '止损', '手动平仓', '到期平仓'];
  
  // 当前价格映射
  const priceMap: Record<string, number> = {};
  if (marketData) {
    marketData.forEach((item: MarketItem) => {
      priceMap[item.symbol] = item.price;
    });
  }
  
  // 生成最近8条交易记录
  for (let i = 0; i < 8; i++) {
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
      type: isLong ? '做多' : '做空',
      action: isClosed ? '平仓' : '开仓',
      quantity,
      price: entryPrice,
      time: new Date(Date.now() - i * 3600000 * 2).toLocaleString('zh-CN'),
      status: isClosed ? 'closed' : 'open',
      pnl: isClosed ? pnlPercent * entryPrice * quantity / 100 : undefined,
      strategy: strategies[i % strategies.length],
      fee: fee,
      slippage: slippage,
      exitReason: isClosed ? exitReasons[Math.floor(Math.random() * exitReasons.length)] : undefined
    });
  }
  
  return trades;
}

// 生成持仓数据
function generatePositions(marketData: MarketItem[]): Position[] {
  const positions = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
  
  // 当前价格映射
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
      side: isLong ? 'long' : 'short',
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
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchMarketData();
      if (data) {
        setMarketData(data);
        setPositions(generatePositions(data));
        setTrades(generateMockTrades(data));
        setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
      }
      setIsLoading(false);
    }
    
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 计算总收益
  const totalValue = 1000000 + positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalPnlPercent = (totalPnl / 1000000) * 100;

  return (
    <div className="space-y-6">
      {/* 实时行情接入状态 */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-medium text-emerald-400">Binance 实时行情已接入</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>数据更新: {lastUpdate || '--'}</span>
            <span>刷新间隔: 30秒</span>
          </div>
        </div>
        
        {/* 实时价格展示 */}
        {marketData.length > 0 && (
          <div className="grid grid-cols-5 gap-3 mt-4">
            {marketData.map((item: MarketItem) => (
              <div key={item.symbol} className="bg-black/20 rounded-lg p-2">
                <div className="text-xs text-gray-400">{item.symbol.replace('USDT', '')}</div>
                <div className="text-sm font-mono font-medium">${item.price.toLocaleString()}</div>
                <div className={`text-xs ${item.change24h >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 收益概览 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            账户权益
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            ${totalValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Activity className="w-4 h-4" />
            总收益
          </div>
          <div className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} USDT
          </div>
          <div className={`text-sm ${totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Target className="w-4 h-4" />
            夏普比率
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {isLoading ? '--' : '2.31'}
          </div>
          <div className="text-xs text-gray-500">年化收益/风险</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Shield className="w-4 h-4" />
            最大回撤
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {isLoading ? '--' : '8.23'}%
          </div>
          <div className="text-xs text-gray-500">组合级风控</div>
        </div>
      </div>

      {/* 当前持仓 */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-semibold">当前持仓</h3>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">加载中...</div>
          ) : (
            <div className="space-y-3">
              {positions.map((pos) => (
                <div key={pos.id} className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pos.side === 'long' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      {pos.side === 'long' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{pos.symbol.replace('USDT', '/USDT')}</div>
                      <div className="text-xs text-gray-400">
                        {pos.side === 'long' ? '做多' : '做空'} · {pos.leverage}x杠杆
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono text-sm">${pos.currentPrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">
                      入场: ${pos.entryPrice.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <div className={`font-mono font-medium ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                    </div>
                    <div className={`text-xs ${pos.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="text-right min-w-[60px]">
                    <div className="font-mono text-sm">{pos.quantity}</div>
                    <div className="text-xs text-gray-400">数量</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 交易记录 */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-semibold">交易记录</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20">
              <tr className="text-left text-xs text-gray-400">
                <th className="p-3">时间</th>
                <th className="p-3">币种</th>
                <th className="p-3">方向</th>
                <th className="p-3">动作</th>
                <th className="p-3">数量</th>
                <th className="p-3">价格</th>
                <th className="p-3">策略</th>
                <th className="p-3">手续费</th>
                <th className="p-3">滑点</th>
                <th className="p-3">盈亏</th>
                <th className="p-3">状态</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {trades.map((trade) => (
                <tr key={trade.id} className="border-t border-slate-700/50">
                  <td className="p-3 text-gray-400">{trade.time}</td>
                  <td className="p-3 font-medium">{trade.symbol.replace('USDT', '')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.type === '做多' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.action === '开仓' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {trade.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{trade.quantity}</td>
                  <td className="p-3 font-mono">${trade.price.toLocaleString()}</td>
                  <td className="p-3 text-xs text-gray-400">{trade.strategy}</td>
                  <td className="p-3 font-mono text-xs">{trade.fee.toFixed(4)}</td>
                  <td className="p-3 font-mono text-xs">{trade.slippage.toFixed(6)}</td>
                  <td className="p-3">
                    {trade.pnl !== undefined ? (
                      <span className={trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500">--</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.status === 'open' 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'bg-gray-500/20 text-gray-400'
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
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <h3 className="font-semibold mb-4">灰度上线进度</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm">1%资金</div>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="text-sm text-emerald-400">已完成 24h</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm">5%资金</div>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="text-sm text-emerald-400">已完成 48h</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm">20%资金</div>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <div className="text-sm text-cyan-400">进行中 36h</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm">100%资金</div>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div className="bg-slate-600 h-2 rounded-full" style={{ width: '0%' }} />
            </div>
            <div className="text-sm text-gray-500">待完成</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="text-sm text-amber-400">准入条件</div>
          <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
            <div className="text-gray-400">✓ 连续盈利交易日: <span className="text-emerald-400">60天</span></div>
            <div className="text-gray-400">✓ 夏普比率: <span className="text-emerald-400">2.31</span></div>
            <div className="text-gray-400">✓ 日交易笔数: <span className="text-emerald-400">12笔</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
