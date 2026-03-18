"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Pause,
  Play,
  XCircle,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Check,
  Code,
} from "lucide-react";
import {
  useTasks,
  useCreateTask,
  usePauseTask,
  useResumeTask,
  useCancelTask,
} from "@/lib/hooks/use-tasks";
import { useModels } from "@/lib/hooks/use-models";
import { useDatasets } from "@/lib/hooks/use-datasets";
import { useCriteria } from "@/lib/hooks/use-criteria";
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

const STEPS = [
  { key: "model", label: "选择模型" },
  { key: "datasets", label: "选择数据集" },
  { key: "params", label: "参数配置" },
  { key: "review", label: "确认并运行" },
] as const;

export default function TasksPage() {
  const router = useRouter();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: models = [] } = useModels();
  const { data: datasets = [] } = useDatasets();
  const { data: criteria = [] } = useCriteria();
  const createTask = useCreateTask();
  const pause = usePauseTask();
  const resume = useResumeTask();
  const cancel = useCancelTask();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [form, setForm] = useState({
    name: "",
    model_id: "",
    dataset_ids: [] as string[],
    criteria_ids: [] as string[],
    temperature: "0.7",
    max_tokens: "1024",
    repeat_count: "1",
    seed_strategy: "fixed",
    limit: "",
  });

  const resetWizard = () => {
    setStep(0);
    setShowConfig(false);
    setForm({
      name: "",
      model_id: "",
      dataset_ids: [],
      criteria_ids: [],
      temperature: "0.7",
      max_tokens: "1024",
      repeat_count: "1",
      seed_strategy: "fixed",
      limit: "",
    });
  };

  const handleCreate = async () => {
    const paramsObj: Record<string, unknown> = {
      temperature: parseFloat(form.temperature),
      max_tokens: parseInt(form.max_tokens),
    };
    if (form.limit) paramsObj.limit = parseInt(form.limit);
    await createTask.mutateAsync({
      name: form.name,
      model_id: form.model_id,
      dataset_ids: form.dataset_ids,
      criteria_ids: form.criteria_ids,
      params_json: JSON.stringify(paramsObj),
      repeat_count: parseInt(form.repeat_count),
      seed_strategy: form.seed_strategy,
    });
    setOpen(false);
    resetWizard();
  };

  const toggleDataset = (id: string) => {
    setForm((f) => ({
      ...f,
      dataset_ids: f.dataset_ids.includes(id)
        ? f.dataset_ids.filter((d) => d !== id)
        : [...f.dataset_ids, id],
    }));
  };

  const toggleCriterion = (id: string) => {
    setForm((f) => ({
      ...f,
      criteria_ids: f.criteria_ids.includes(id)
        ? f.criteria_ids.filter((c) => c !== id)
        : [...f.criteria_ids, id],
    }));
  };

  const canNext = () => {
    if (step === 0) return !!form.model_id;
    if (step === 1)
      return form.dataset_ids.length > 0 && form.criteria_ids.length > 0;
    if (step === 2) return !!form.name;
    return true;
  };

  const selectedModel = models.find((m) => m.id === form.model_id);

  // Build config preview object
  const configPreview = {
    name: form.name || "(untitled)",
    model: selectedModel?.name ?? form.model_id,
    datasets: form.dataset_ids.map(
      (id) => datasets.find((d) => d.id === id)?.name ?? id
    ),
    criteria: form.criteria_ids.map(
      (id) => criteria.find((c) => c.id === id)?.name ?? id
    ),
    params: {
      temperature: parseFloat(form.temperature),
      max_tokens: parseInt(form.max_tokens),
      ...(form.limit ? { limit: parseInt(form.limit) } : {}),
    },
    repeat_count: parseInt(form.repeat_count),
    seed_strategy: form.seed_strategy,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">评测任务</h1>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetWizard();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> 新建任务
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>创建评测任务</DialogTitle>
            </DialogHeader>

            {/* Stepper */}
            <div className="flex items-center gap-1 mb-4">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1 flex-1">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium shrink-0 transition-colors ${
                      i < step
                        ? "bg-primary text-primary-foreground cursor-pointer"
                        : i === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </button>
                  <span
                    className={`text-xs truncate ${i === step ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Step 0: Model */}
            {step === 0 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>模型</Label>
                  <Select
                    value={form.model_id}
                    onValueChange={(v) => setForm({ ...form, model_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}{" "}
                          <span className="text-muted-foreground">
                            ({m.provider})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {models.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      暂无已注册模型，请先在模型页面添加。
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Datasets + Criteria */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>数据集（点击选择）</Label>
                  <div className="flex flex-wrap gap-1.5 rounded border p-2 min-h-[2.5rem]">
                    {datasets.map((ds) => (
                      <button
                        key={ds.id}
                        type="button"
                        onClick={() => toggleDataset(ds.id)}
                        className={`rounded px-2 py-0.5 text-xs border transition-colors ${
                          form.dataset_ids.includes(ds.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted hover:bg-accent"
                        }`}
                      >
                        {ds.name}
                      </button>
                    ))}
                    {datasets.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        暂无可用数据集
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {form.dataset_ids.length} 已选择
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>评估标准（点击选择）</Label>
                  <div className="flex flex-wrap gap-1.5 rounded border p-2 min-h-[2.5rem]">
                    {criteria.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCriterion(c.id)}
                        className={`rounded px-2 py-0.5 text-xs border transition-colors ${
                          form.criteria_ids.includes(c.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted hover:bg-accent"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                    {criteria.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        暂无可用评估标准
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {form.criteria_ids.length} 已选择
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Parameters */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>任务名称</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder={`${selectedModel?.name ?? "模型"} 评测`}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>温度</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={form.temperature}
                      onChange={(e) =>
                        setForm({ ...form, temperature: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>最大 Token 数</Label>
                    <Input
                      type="number"
                      value={form.max_tokens}
                      onChange={(e) =>
                        setForm({ ...form, max_tokens: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>
                      限制{" "}
                      <span className="text-muted-foreground font-normal">
                        （样本数）
                      </span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.limit}
                      onChange={(e) =>
                        setForm({ ...form, limit: e.target.value })
                      }
                      placeholder="全部"
                    />
                    <p className="text-xs text-muted-foreground">
                      留空则评测全部数据行，设置小数值可用于快速调试。
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label>重复次数</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.repeat_count}
                      onChange={(e) =>
                        setForm({ ...form, repeat_count: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>种子策略</Label>
                  <Select
                    value={form.seed_strategy}
                    onValueChange={(v) =>
                      setForm({ ...form, seed_strategy: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">固定</SelectItem>
                      <SelectItem value="random">随机</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">模型</p>
                    <p className="font-medium">{selectedModel?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">任务名称</p>
                    <p className="font-medium">{form.name || "(untitled)"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">数据集</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {form.dataset_ids.map((id) => (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {datasets.find((d) => d.id === id)?.name ?? id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">评估标准</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {form.criteria_ids.map((id) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {criteria.find((c) => c.id === id)?.name ?? id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      温度 / 最大 Token 数
                    </p>
                    <p className="font-mono text-xs">
                      {form.temperature} / {form.max_tokens}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      重复 / 种子 / 限制
                    </p>
                    <p className="font-mono text-xs">
                      {form.repeat_count}x / {form.seed_strategy} /{" "}
                      {form.limit || "全部"}
                    </p>
                  </div>
                </div>

                {/* Config JSON toggle */}
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Code className="h-3.5 w-3.5" />
                  {showConfig ? "隐藏" : "显示"}配置 JSON
                </button>
                {showConfig && (
                  <pre className="rounded bg-muted p-3 text-xs font-mono overflow-auto max-h-48">
                    {JSON.stringify(configPreview, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" /> 上一步
              </Button>
              {step < 3 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext()}
                >
                  下一步 <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreate}
                  disabled={createTask.isPending || !form.name}
                >
                  {createTask.isPending ? "创建中..." : "创建并运行"}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>重复</TableHead>
                <TableHead>种子</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    暂无任务。
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((t) => {
                  const duration =
                    t.started_at && t.finished_at
                      ? `${((new Date(t.finished_at).getTime() - new Date(t.started_at).getTime()) / 1000).toFixed(1)}s`
                      : t.started_at
                        ? "运行中..."
                        : "-";

                  return (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/tasks/${t.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t.name}</span>
                          {t.status === "failed" && (
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(t.status)}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {t.repeat_count}
                      </TableCell>
                      <TableCell>{t.seed_strategy}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">{duration}</TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.status === "running" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => pause.mutate(t.id)}
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {(t.status === "paused" ||
                            t.status === "failed") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => resume.mutate(t.id)}
                            >
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {(t.status === "running" ||
                            t.status === "pending") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => cancel.mutate(t.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
