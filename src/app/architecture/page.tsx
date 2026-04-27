import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { ArchitectureView } from '@/components/architecture/architecture-view';

export const metadata: Metadata = {
  title: '三层混合架构',
  description: '虚拟货币合约量化交易系统 - 三层混合架构',
};

export default function ArchitecturePage() {
  return (
    <AppLayout>
      <ArchitectureView />
    </AppLayout>
  );
}
