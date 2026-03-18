"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useLeaderboard, useResults } from "@/lib/hooks/use-results";
import { useCriteria } from "@/lib/hooks/use-criteria";
import { useTasks } from "@/lib/hooks/use-tasks";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

const barColors = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export default function ResultsPage() {
  const { data: criteria = [] } = useCriteria();
  const { data: allTasks = [] } = useTasks();
  const completedTasks = allTasks.filter((t) => t.status === "completed" || t.status === "failed");

  const [criterionFilter, setCriterionFilter] = useState<string>("__all__");
  const [taskFilter, setTaskFilter] = useState<string>("__all__");
  const [detailPage, setDetailPage] = useState(1);

  const { data: leaderboard = [], isLoading } = useLeaderboard(
    criterionFilter === "__all__" ? undefined : criterionFilter
  );

  const { data: detailResults = [] } = useResults(
    taskFilter === "__all__" ? undefined : taskFilter,
    detailPage,
    20
  );

  // Group leaderboard by model for charts
  const modelIndex: Record<
    string,
    { name: string; scores: Record<string, number> }
  > = {};
  for (const entry of leaderboard) {
    if (!modelIndex[entry.model_id]) {
      modelIndex[entry.model_id] = { name: entry.model_name, scores: {} };
    }
    modelIndex[entry.model_id].scores[entry.criterion_name] = entry.avg_score;
  }

  const modelEntries = Object.values(modelIndex);

  const barData = modelEntries.map((m) => ({
    name: m.name,
    ...m.scores,
  }));

  const allCriteriaNames = leaderboard.reduce<string[]>((acc, e) => {
    if (!acc.includes(e.criterion_name)) acc.push(e.criterion_name);
    return acc;
  }, []);

  const radarData = allCriteriaNames.map((cn) => {
    const point: Record<string, string | number> = { criterion: cn };
    modelEntries.forEach((m) => {
      point[m.name] = m.scores[cn] ?? 0;
    });
    return point;
  });

  const modelNames = modelEntries.map((m) => m.name);

  // Export leaderboard as CSV
  const exportCSV = () => {
    if (leaderboard.length === 0) return;
    const headers = ["Model", "Criterion", "Avg Score", "Total Prompts", "Avg Latency (ms)"];
    const rows = leaderboard.map((e) => [
      e.model_name,
      e.criterion_name,
      (e.avg_score * 100).toFixed(1),
      e.total_prompts,
      e.avg_latency_ms.toFixed(0),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leaderboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">结果分析 Results</h1>
        <div className="flex items-center gap-2">
          <Select value={criterionFilter} onValueChange={setCriterionFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All criteria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All criteria</SelectItem>
              {criteria.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={leaderboard.length === 0}>
            <Download className="mr-1 h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="detail">Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <p className="py-8 text-center text-muted-foreground">
                  Loading...
                </p>
              ) : leaderboard.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No results yet. Run evaluation tasks first.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Criterion</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Prompts</TableHead>
                      <TableHead className="text-right">Avg Latency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry, i) => (
                      <TableRow
                        key={`${entry.model_id}-${entry.criterion_id}`}
                      >
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.model_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entry.criterion_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {(entry.avg_score * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.total_prompts}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.avg_latency_ms.toFixed(0)}ms
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Score Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No data to chart.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    {allCriteriaNames.map((cn, i) => (
                      <Bar
                        key={cn}
                        dataKey={cn}
                        fill={barColors[i % barColors.length]}
                        radius={[3, 3, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Multi-dimensional Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {radarData.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No data to chart.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis
                      dataKey="criterion"
                      tick={{ fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 1]}
                      tick={{ fontSize: 10 }}
                    />
                    {modelNames.map((name, i) => (
                      <Radar
                        key={name}
                        name={name}
                        dataKey={name}
                        stroke={barColors[i % barColors.length]}
                        fill={barColors[i % barColors.length]}
                        fillOpacity={0.15}
                      />
                    ))}
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Result Detail
                </CardTitle>
                <Select value={taskFilter} onValueChange={(v) => { setTaskFilter(v); setDetailPage(1); }}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="All tasks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All tasks</SelectItem>
                    {completedTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {detailResults.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No results. Select a task or run an evaluation first.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead>Model Output</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Latency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailResults.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="max-w-[180px] truncate text-xs">
                            {r.prompt_text}
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate font-mono text-xs">
                            {r.expected_output}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate font-mono text-xs">
                            {r.model_output}
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono text-xs ${r.score >= 1 ? "text-emerald-600" : "text-destructive"}`}
                          >
                            {r.score.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {r.latency_ms.toFixed(0)}ms
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between px-4 py-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={detailPage <= 1}
                      onClick={() => setDetailPage(detailPage - 1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {detailPage}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={detailResults.length < 20}
                      onClick={() => setDetailPage(detailPage + 1)}
                    >
                      Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
