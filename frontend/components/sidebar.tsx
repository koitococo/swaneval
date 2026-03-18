"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Cpu,
  Database,
  TrendingUp,
  Settings,
} from "lucide-react";

/**
 * 侧边栏导航配置
 */
const navItems = [
  { href: "/evaluations", label: "Evaluations", icon: BarChart3 },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/results", label: "Results", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * 可复用的侧边栏组件
 * 根据当前路径自动高亮激活的菜单项
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2
                ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}