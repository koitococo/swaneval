"use client";

import { useState } from "react";
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
  DialogFooter,
  DialogDescription,
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
import { Plus, Trash2, Zap, Loader2 } from "lucide-react";
import {
  useModels,
  useCreateModel,
  useDeleteModel,
  useTestModel,
} from "@/lib/hooks/use-models";

export default function ModelsPage() {
  const { data: models = [], isLoading } = useModels();
  const create = useCreateModel();
  const deleteMut = useDeleteModel();
  const testModel = useTestModel();

  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { ok: boolean; message: string }>
  >({});
  const [form, setForm] = useState({
    name: "",
    provider: "",
    endpoint_url: "",
    api_key: "",
    model_type: "api" as string,
    description: "",
    model_name: "",
    max_tokens: "4096",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      name: form.name,
      provider: form.provider,
      endpoint_url: form.endpoint_url,
      api_key: form.api_key || undefined,
      model_type: form.model_type,
      description: form.description || undefined,
      model_name: form.model_name || undefined,
      max_tokens: form.max_tokens ? parseInt(form.max_tokens) : undefined,
    });
    setForm({
      name: "",
      provider: "",
      endpoint_url: "",
      api_key: "",
      model_type: "api",
      description: "",
      model_name: "",
      max_tokens: "4096",
    });
    setOpen(false);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResults((prev) => ({
      ...prev,
      [id]: { ok: false, message: "测试中..." },
    }));
    try {
      const result = await testModel.mutateAsync(id);
      setTestResults((prev) => ({
        ...prev,
        [id]: { ok: result.ok, message: result.message },
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [id]: { ok: false, message: "连接失败" },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">模型管理</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> 添加模型
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>注册模型</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>显示名称</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="GPT-4o"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>提供商</Label>
                  <Input
                    value={form.provider}
                    onChange={(e) =>
                      setForm({ ...form, provider: e.target.value })
                    }
                    placeholder="openai"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>模型 ID</Label>
                  <Input
                    value={form.model_name}
                    onChange={(e) =>
                      setForm({ ...form, model_name: e.target.value })
                    }
                    placeholder="gpt-4o-2024-08-06"
                  />
                  <p className="text-xs text-muted-foreground">
                    发送至 API 的实际模型标识
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>类型</Label>
                  <Select
                    value={form.model_type}
                    onValueChange={(v) =>
                      setForm({ ...form, model_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="huggingface">HuggingFace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>端点 URL</Label>
                <Input
                  value={form.endpoint_url}
                  onChange={(e) =>
                    setForm({ ...form, endpoint_url: e.target.value })
                  }
                  placeholder="https://api.openai.com/v1/chat/completions"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>API 密钥</Label>
                  <Input
                    type="password"
                    value={form.api_key}
                    onChange={(e) =>
                      setForm({ ...form, api_key: e.target.value })
                    }
                    placeholder="sk-..."
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
                    placeholder="4096"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>描述</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="模型配置备注..."
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={create.isPending}
              >
                {create.isPending ? "添加中..." : "添加模型"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>提供商</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>状态</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : models.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    暂无已注册的模型。
                  </TableCell>
                </TableRow>
              ) : (
                models.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{m.name}</p>
                        {m.model_name && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {m.model_name}
                          </p>
                        )}
                        {m.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{m.provider}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.model_type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {m.endpoint_url}
                    </TableCell>
                    <TableCell>
                      {testResults[m.id] ? (
                        <Badge
                          variant={
                            testResults[m.id].message === "测试中..."
                              ? "outline"
                              : testResults[m.id].ok
                                ? "default"
                                : "destructive"
                          }
                        >
                          {testResults[m.id].message === "测试中..."
                            ? "测试中..."
                            : testResults[m.id].ok
                              ? "OK"
                              : "Failed"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          -
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleTest(m.id)}
                        disabled={testingId === m.id}
                        title="测试连接"
                      >
                        {testingId === m.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Zap className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() =>
                          setDeleteTarget({ id: m.id, name: m.name })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>删除模型</DialogTitle>
            <DialogDescription>
              确定要删除 &quot;{deleteTarget?.name}&quot; 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "删除中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
