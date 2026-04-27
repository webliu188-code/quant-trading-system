import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { DataDashboard } from '@/components/data/data-dashboard';

export const metadata: Metadata = {
  title: '数据看板',
  description: '虚拟货币合约量化交易系统 - 数据看板',
};

export default function DataPage() {
  return (
    <AppLayout>
      <DataDashboard />
    </AppLayout>
  );
}
