"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Ruler, Cpu, PlayCircle } from "lucide-react";
import { useDatasets } from "@/lib/hooks/use-datasets";
import { useCriteria } from "@/lib/hooks/use-criteria";
import { useModels } from "@/lib/hooks/use-models";
import { useTasks } from "@/lib/hooks/use-tasks";
import type { EvalTask } from "@/lib/types";

const statusVariant = (s: EvalTask["status"]) => {
  const map: Record<string, "success" | "warning" | "destructive" | "default" | "secondary"> = {
    completed: "success",
    running: "warning",
    failed: "destructive",
    pending: "secondary",
    paused: "default",
  };
  return map[s] || "default";
};

export default function OverviewPage() {
  const datasets = useDatasets();
  const criteria = useCriteria();
  const models = useModels();
  const tasks = useTasks();

  const stats = [
    { label: "Datasets", value: datasets.data?.length ?? 0, icon: Database, href: "/datasets" },
    { label: "Criteria", value: criteria.data?.length ?? 0, icon: Ruler, href: "/criteria" },
    { label: "Models", value: models.data?.length ?? 0, icon: Cpu, href: "/models" },
    { label: "Tasks", value: tasks.data?.length ?? 0, icon: PlayCircle, href: "/tasks" },
  ];

  const recentTasks = (tasks.data ?? []).slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Overview</h1>

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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No tasks yet.{" "}
              <Link href="/tasks" className="text-primary underline">
                Create one
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
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
