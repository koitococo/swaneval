"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Pause, Play, XCircle } from "lucide-react";
import { useTask, useSubtasks, usePauseTask, useResumeTask, useCancelTask } from "@/lib/hooks/use-tasks";
import { useTaskSummary, useErrorResults } from "@/lib/hooks/use-results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const statusVariant = (s: string) => {
  const map: Record<string, "success" | "warning" | "destructive" | "default" | "secondary"> = {
    completed: "success",
    running: "warning",
    failed: "destructive",
    pending: "secondary",
    paused: "default",
  };
  return map[s] || "default";
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading } = useTask(id);
  const { data: subtasks = [] } = useSubtasks(id);
  const { data: summary = [] } = useTaskSummary(id);
  const { data: errors = [] } = useErrorResults(id);
  const pause = usePauseTask();
  const resumeTask = useResumeTask();
  const cancel = useCancelTask();

  if (isLoading || !task) {
    return <div className="text-muted-foreground py-12 text-center">Loading...</div>;
  }

  const params = (() => {
    try {
      return JSON.parse(task.params_json);
    } catch {
      return {};
    }
  })();

  const chartData = summary.map((s) => ({
    name: s.criterion_name,
    score: s.avg_score,
    latency: s.avg_latency_ms,
  }));

  const barColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/tasks">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{task.name}</h1>
          <p className="text-xs text-muted-foreground">
            Created {new Date(task.created_at).toLocaleString()}
          </p>
        </div>
        <Badge variant={statusVariant(task.status)} className="text-sm">
          {task.status}
        </Badge>
        {task.status === "running" && (
          <Button variant="outline" size="sm" onClick={() => pause.mutate(id)}>
            <Pause className="mr-1 h-3.5 w-3.5" /> Pause
          </Button>
        )}
        {(task.status === "paused" || task.status === "failed") && (
          <Button variant="outline" size="sm" onClick={() => resumeTask.mutate(id)}>
            <Play className="mr-1 h-3.5 w-3.5" /> Resume
          </Button>
        )}
        {(task.status === "running" || task.status === "pending") && (
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => cancel.mutate(id)}>
            <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
          </Button>
        )}
      </div>

      {/* Config summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Repeat Count", value: task.repeat_count },
          { label: "Seed Strategy", value: task.seed_strategy },
          { label: "Temperature", value: params.temperature ?? "-" },
          { label: "Max Tokens", value: params.max_tokens ?? "-" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium">{String(item.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subtasks progress */}
      {subtasks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subtasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">Run {st.run_index + 1}</span>
                <Progress value={st.progress_pct} className="flex-1 h-2" />
                <span className="text-xs font-mono w-12 text-right">
                  {st.progress_pct.toFixed(0)}%
                </span>
                <Badge variant={statusVariant(st.status)}>{st.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="errors">Errors ({errors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {summary.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {task.status === "running" || task.status === "pending"
                  ? "Task is still running..."
                  : "No results yet."}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Score chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Scores by Criterion</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={barColors[i % barColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Summary table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Criterion</TableHead>
                        <TableHead className="text-right">Avg Score</TableHead>
                        <TableHead className="text-right">Min</TableHead>
                        <TableHead className="text-right">Max</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Avg Latency</TableHead>
                        <TableHead className="text-right">Avg Tokens</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.map((s) => (
                        <TableRow key={s.criterion_id}>
                          <TableCell className="font-medium">{s.criterion_name}</TableCell>
                          <TableCell className="text-right font-mono">{s.avg_score.toFixed(4)}</TableCell>
                          <TableCell className="text-right font-mono">{s.min_score.toFixed(4)}</TableCell>
                          <TableCell className="text-right font-mono">{s.max_score.toFixed(4)}</TableCell>
                          <TableCell className="text-right font-mono">{s.count}</TableCell>
                          <TableCell className="text-right font-mono">{s.avg_latency_ms.toFixed(0)}ms</TableCell>
                          <TableCell className="text-right font-mono">{s.avg_tokens.toFixed(0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardContent className="p-0">
              {errors.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No errors found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Model Output</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errors.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="max-w-[200px] truncate">{r.prompt_text}</TableCell>
                        <TableCell className="max-w-[150px] truncate font-mono text-xs">
                          {r.expected_output}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-mono text-xs">
                          {r.model_output}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          {r.score.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
