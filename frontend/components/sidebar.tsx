"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Ruler,
  Cpu,
  PlayCircle,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/criteria", label: "Criteria", icon: Ruler },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/tasks", label: "Tasks", icon: PlayCircle },
  { href: "/results", label: "Results", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-base-100">
      <div className="flex h-12 items-center border-b px-4">
        <span className="text-sm font-semibold tracking-tight">SwanEVAL</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
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
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-base-200 text-base-content font-medium"
                  : "text-base-content/50 hover:bg-base-200/50 hover:text-base-content"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="border-t p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.username}</p>
              <p className="truncate text-xs text-base-content/50">{user.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="rounded p-1 text-base-content/50 hover:bg-base-200 hover:text-base-content"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
