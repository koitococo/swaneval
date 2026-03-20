"use client";

import { useState } from "react";
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
  Users,
  Settings,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateProfile, useChangePassword } from "@/lib/hooks/use-users";

const nav = [
  { href: "/", label: "概览", icon: LayoutDashboard },
  { href: "/models", label: "模型", icon: Cpu },
  { href: "/datasets", label: "数据集", icon: Database },
  { href: "/criteria", label: "评估标准", icon: Ruler },
  { href: "/tasks", label: "评测任务", icon: PlayCircle },
  { href: "/results", label: "结果分析", icon: BarChart3 },
];

const adminNav = { href: "/admin", label: "用户管理", icon: Users };

export function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const allNav = user?.role === "admin" ? [...nav, adminNav] : nav;

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6 gap-6">
          <Link href="/" className="shrink-0 mr-2 flex items-center gap-2 text-primary">
            <Logo className="h-5 w-5" />
            <span className="text-base font-bold tracking-tight">SwanEVAL</span>
          </Link>

          <nav className="flex items-center gap-1 flex-1">
            {allNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all duration-150 whitespace-nowrap",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSettingsOpen(true)}
                className="text-right hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
              >
                <p className="text-sm font-medium leading-none">{user.nickname || user.username}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="账号设置"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="退出登录"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {user && (
        <AccountSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          user={user}
        />
      )}
    </>
  );
}

function AccountSettingsDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { username: string; nickname: string; email: string; role: string };
}) {
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [nickname, setNickname] = useState(user.nickname || "");
  const [email, setEmail] = useState(user.email || "");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    try {
      const updated = await updateProfile.mutateAsync({ nickname, email });
      // Update local auth store
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...parsed, ...updated }));
      }
      setProfileSuccess("保存成功");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : undefined;
      setProfileError(detail || "保存失败");
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (!oldPassword || !newPassword) {
      setPwError("请填写旧密码和新密码");
      return;
    }
    try {
      await changePassword.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPwSuccess("密码修改成功");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setPwSuccess(""), 3000);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : undefined;
      setPwError(detail || "密码修改失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>账号设置</DialogTitle>
          <DialogDescription>管理您的个人信息和密码。</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Profile section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">个人信息</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="settings-username">用户名</Label>
                <Input
                  id="settings-username"
                  value={user.username}
                  disabled
                  className="h-9 bg-muted/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-nickname">昵称</Label>
                <Input
                  id="settings-nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="h-9"
                  placeholder="设置昵称"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email">邮箱</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            {profileError && (
              <p className="text-sm text-destructive">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-sm text-emerald-600">{profileSuccess}</p>
            )}
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              保存
            </Button>
          </div>

          <div className="border-t" />

          {/* Password section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">修改密码</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="settings-old-pw">旧密码</Label>
                <Input
                  id="settings-old-pw"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="h-9"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-new-pw">新密码</Label>
                <Input
                  id="settings-new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9"
                  autoComplete="new-password"
                />
              </div>
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            {pwSuccess && (
              <p className="text-sm text-emerald-600">{pwSuccess}</p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleChangePassword}
              disabled={changePassword.isPending}
            >
              {changePassword.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              修改密码
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
