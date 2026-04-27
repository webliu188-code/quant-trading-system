import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      {/* 移动端底部导航 */}
      <MobileNav />
      <main className="flex-1 overflow-auto bg-background pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
