"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Cpu,
  PlayCircle,
  BarChart3,
  Ruler,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "概览", icon: LayoutDashboard },
  { href: "/models", label: "模型", icon: Cpu },
  { href: "/datasets", label: "数据集", icon: Database },
  { href: "/criteria", label: "评估标准", icon: Ruler },
  { href: "/tasks", label: "评测任务", icon: PlayCircle },
  { href: "/results", label: "结果分析", icon: BarChart3 },
];

export function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="flex h-12 items-center px-5 gap-5">
        <Link
          href="/"
          className="shrink-0 mr-1 flex items-center gap-2 text-primary"
        >
          <Logo className="h-5 w-5" />
          <span className="text-sm font-bold tracking-tight">
            SwanEVAL
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 flex-1" role="navigation">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150",
                  active
                    ? "text-primary bg-primary/[0.06]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium leading-none">
                {user.username}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {user.role}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150"
              title="退出登录"
              aria-label="退出登录"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
