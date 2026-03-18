"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Cpu,
  PlayCircle,
  BarChart3,
  Plus,
  AlertTriangle,
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
  const recentTasks = allTasks.slice(0, 8);
  const failedTasks = allTasks.filter((t) => t.status === "failed").slice(0, 5);
  const runningCount = allTasks.filter((t) => t.status === "running").length;
  const completedCount = allTasks.filter(
    (t) => t.status === "completed"
  ).length;

  const stats = [
    {
      label: "模型",
      value: models.data?.length ?? 0,
      icon: Cpu,
      href: "/models",
    },
    {
      label: "数据集",
      value: datasets.data?.length ?? 0,
      icon: Database,
      href: "/datasets",
    },
    {
      label: "运行中",
      value: runningCount,
      icon: PlayCircle,
      href: "/tasks",
    },
    {
      label: "已完成",
      value: completedCount,
      icon: BarChart3,
      href: "/results",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">概览</h1>
        <div className="flex gap-2">
          <Link href="/tasks">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> 新建评测
            </Button>
          </Link>
          <Link href="/results">
            <Button size="sm" variant="outline">
              <BarChart3 className="mr-1 h-4 w-4" /> 查看结果
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-md bg-primary/10 p-2">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">最近任务</CardTitle>
              <Link
                href="/tasks"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                查看全部 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                暂无任务。{" "}
                <Link href="/tasks" className="text-primary underline">
                  创建一个
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={statusVariant(t.status)}>
                      {statusLabel[t.status] ?? t.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              失败任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            {failedTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                暂无失败任务。
              </p>
            ) : (
              <div className="space-y-2">
                {failedTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center justify-between rounded-md border border-destructive/20 px-3 py-2 hover:bg-destructive/5 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive">失败</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
