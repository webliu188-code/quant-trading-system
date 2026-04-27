import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { Dashboard } from '@/components/dashboard/dashboard';

export const metadata: Metadata = {
  title: '系统概览',
  description: '虚拟货币合约量化交易系统 - 系统概览',
};

export default function HomePage() {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
