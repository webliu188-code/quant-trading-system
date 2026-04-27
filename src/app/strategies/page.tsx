import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { StrategyManager } from '@/components/strategies/strategy-manager';

export const metadata: Metadata = {
  title: '策略管理',
  description: '虚拟货币合约量化交易系统 - 策略管理',
};

export default function StrategiesPage() {
  return (
    <AppLayout>
      <StrategyManager />
    </AppLayout>
  );
}
