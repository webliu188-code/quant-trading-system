import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { SimulationPanel } from '@/components/simulation/simulation-panel';

export const metadata: Metadata = {
  title: '模拟盘',
  description: '虚拟货币合约量化交易系统 - 模拟盘管理',
};

export default function SimulationPage() {
  return (
    <AppLayout>
      <SimulationPanel />
    </AppLayout>
  );
}
