import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '量化交易监测系统内测版V1.0',
    template: '%s | 量化交易监测系统',
  },
  description:
    '基于Coze的虚拟货币合约量化交易系统，采用三层混合架构，实现AI驱动的智能量化交易决策。',
  keywords: [
    '量化交易',
    '合约交易',
    '虚拟货币',
    'AI交易',
    '量化策略',
    '风控系统',
  ],
  authors: [{ name: '量化交易系统团队' }],
  generator: '量化交易系统',
  // icons: {
  //   icon: '',
  // },
  openGraph: {
    title: '量化交易监测系统内测版V1.0',
    description:
      '基于Coze的虚拟货币合约量化交易系统，采用三层混合架构，实现AI驱动的智能量化交易决策。',
    url: 'https://量化交易监测系统.com',
    siteName: '量化交易监测系统',
    locale: 'zh_CN',
    type: 'website',
    // images: [
    //   {
    //     url: '',
    //     width: 1200,
    //     height: 630,
    //     alt: '扣子编程 - 你的 AI 工程师',
    //   },
    // ],
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Coze Code | Your AI Engineer is Here',
  //   description:
  //     'Build and deploy full-stack applications through AI conversation. No env setup, just flow.',
  //   // images: [''],
  // },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
