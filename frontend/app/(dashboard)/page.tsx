"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Database,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useDatasets } from "@/lib/hooks/use-datasets";
import { useModels } from "@/lib/hooks/use-models";
import { useTasks } from "@/lib/hooks/use-tasks";
import type { EvalTask } from "@/lib/types";

const statusVariant = (
  s: EvalTask["status"]
): "default" | "secondary" | "destructive" | "outline" => {
  const map: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    completed: "default",
    running: "secondary",
    failed: "destructive",
    pending: "outline",
    paused: "outline",
  };
  return map[s] || "outline";
};

const statusLabel: Record<string, string> = {
  completed: "已完成",
  running: "运行中",
  failed: "失败",
  pending: "等待中",
  paused: "已暂停",
};

export default function OverviewPage() {
  const datasets = useDatasets();
  const models = useModels();
  const tasks = useTasks();

  const allTasks = tasks.data ?? [];
  const recentTasks = allTasks.slice(0, 20);
  const failedTasks = allTasks
    .filter((t) => t.status === "failed")
    .slice(0, 20);
  const runningCount = allTasks.filter((t) => t.status === "running").length;
  const completedCount = allTasks.filter(
    (t) => t.status === "completed"
  ).length;
  const failedCount = failedTasks.length;

  return (
    <div className="dashboard-hero-bg flex flex-col h-[calc(100vh-3.5rem)] -m-6">
      <div className="d-blob" />

      {/* ── Hero: title + HUD metrics ── */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-10 pb-6 px-6 shrink-0">
        <h1 className="text-4xl font-bold tracking-tight text-foreground/90">
          概览
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          人工智能模型能力评估工具
        </p>

        {/* Floating HUD metrics */}
        <div className="flex items-center gap-8 mt-8">
          <Link
            href="/models"
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
              <Cpu className="h-3.5 w-3.5" />
              <span className="text-xs">模型</span>
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {models.data?.length ?? 0}
            </span>
          </Link>

          <div className="w-px h-8 bg-border" />

          <Link
            href="/datasets"
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
              <Database className="h-3.5 w-3.5" />
              <span className="text-xs">数据集</span>
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {datasets.data?.length ?? 0}
            </span>
          </Link>

          <div className="w-px h-8 bg-border" />

          <Link
            href="/tasks"
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
              <PlayCircle className="h-3.5 w-3.5" />
              <span className="text-xs">运行中</span>
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {runningCount}
            </span>
          </Link>

          <div className="w-px h-8 bg-border" />

          <Link
            href="/results"
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-xs">已完成</span>
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {completedCount}
            </span>
          </Link>

          {failedCount > 0 && (
            <>
              <div className="w-px h-8 bg-border" />
              <Link
                href="/tasks"
                className="group flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-1.5 text-destructive/70 group-hover:text-destructive transition-colors">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-xs">失败</span>
                </div>
                <span className="text-2xl font-semibold tabular-nums text-destructive/80">
                  {failedCount}
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Two-pane task lists ── */}
      <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 pb-6">
        {/* Left: recent tasks */}
        <div className="flex flex-col min-h-0 rounded-lg border bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              最近任务
            </div>
            <Link
              href="/tasks"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            {recentTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">
                  暂无任务。{" "}
                  <Link href="/tasks" className="text-primary hover:underline">
                    创建一个
                  </Link>
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {recentTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={statusVariant(t.status)}
                      className="shrink-0"
                    >
                      {statusLabel[t.status] ?? t.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: failed tasks */}
        <div className="flex flex-col min-h-0 rounded-lg border bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive/70" />
              失败任务
            </div>
            {failedCount > 0 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {failedCount} 项
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            {failedTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">暂无失败任务。</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {failedTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-destructive/5 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      失败
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
