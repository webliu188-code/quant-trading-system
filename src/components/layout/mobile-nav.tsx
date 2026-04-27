"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Brain,
  Activity,
  Shield,
  PlayCircle,
  Database,
} from "lucide-react";

const navItems = [
  { href: "/", label: "首页", icon: LayoutDashboard },
  { href: "/architecture", label: "架构", icon: GitBranch },
  { href: "/strategies", label: "策略", icon: Brain },
  { href: "/signals", label: "信号", icon: Activity },
  { href: "/risk", label: "风控", icon: Shield },
  { href: "/simulation", label: "模拟", icon: PlayCircle },
  { href: "/data", label: "数据", icon: Database },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
