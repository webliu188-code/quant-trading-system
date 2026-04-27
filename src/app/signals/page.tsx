import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { SignalsMonitor } from '@/components/signals/signals-monitor';

export const metadata: Metadata = {
  title: '信号监控',
  description: '虚拟货币合约量化交易系统 - 信号监控',
};

export default function SignalsPage() {
  return (
    <AppLayout>
      <SignalsMonitor />
    </AppLayout>
  );
}
