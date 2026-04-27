import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { RiskDashboard } from '@/components/risk/risk-dashboard';

export const metadata: Metadata = {
  title: '风控仪表盘',
  description: '虚拟货币合约量化交易系统 - 风控仪表盘',
};

export default function RiskPage() {
  return (
    <AppLayout>
      <RiskDashboard />
    </AppLayout>
  );
}
