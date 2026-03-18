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
import { Plus, Trash2, FlaskConical } from "lucide-react";
import { useCriteria, useCreateCriterion, useDeleteCriterion, useTestCriterion } from "@/lib/hooks/use-criteria";

const typeColors: Record<string, "default" | "secondary" | "warning" | "success"> = {
  preset: "default",
  regex: "secondary",
  script: "warning",
  llm_judge: "success",
};

export default function CriteriaPage() {
  const { data: criteria = [], isLoading } = useCriteria();
  const create = useCreateCriterion();
  const deleteMut = useDeleteCriterion();
  const test = useTestCriterion();

  const [open, setOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testId, setTestId] = useState("");
  const [testForm, setTestForm] = useState({ prompt: "", expected: "", actual: "" });
  const [testResult, setTestResult] = useState<{ score: number } | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "preset" as string,
    metric: "exact_match",
    pattern: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    let config: Record<string, unknown> = {};
    if (form.type === "preset") config = { metric: form.metric };
    else if (form.type === "regex") config = { pattern: form.pattern };

    await create.mutateAsync({
      name: form.name,
      type: form.type,
      config_json: JSON.stringify(config),
    });
    setForm({ name: "", type: "preset", metric: "exact_match", pattern: "" });
    setOpen(false);
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await test.mutateAsync({
      criterion_id: testId,
      ...testForm,
    });
    setTestResult(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Evaluation Criteria</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> New Criterion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Criterion</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preset">Preset Metric</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                    <SelectItem value="script">Script</SelectItem>
                    <SelectItem value="llm_judge">LLM Judge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === "preset" && (
                <div className="space-y-1">
                  <Label>Metric</Label>
                  <Select value={form.metric} onValueChange={(v) => setForm({ ...form, metric: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exact_match">Exact Match</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="numeric">Numeric Closeness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.type === "regex" && (
                <div className="space-y-1">
                  <Label>Pattern</Label>
                  <Input
                    value={form.pattern}
                    onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                    placeholder="e.g. \\d+"
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? "Creating..." : "Create"}
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Config</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading...</TableCell>
                </TableRow>
              ) : criteria.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No criteria defined.</TableCell>
                </TableRow>
              ) : (
                criteria.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant={typeColors[c.type] ?? "default"}>{c.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">{c.config_json}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setTestId(c.id);
                          setTestResult(null);
                          setTestForm({ prompt: "", expected: "", actual: "" });
                          setTestOpen(true);
                        }}
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteMut.mutate(c.id)}
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

      {/* Test Dialog */}
      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Criterion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTest} className="space-y-3">
            <div className="space-y-1">
              <Label>Prompt</Label>
              <Input
                value={testForm.prompt}
                onChange={(e) => setTestForm({ ...testForm, prompt: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Expected Output</Label>
              <Input
                value={testForm.expected}
                onChange={(e) => setTestForm({ ...testForm, expected: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Actual Output</Label>
              <Input
                value={testForm.actual}
                onChange={(e) => setTestForm({ ...testForm, actual: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={test.isPending}>
              {test.isPending ? "Testing..." : "Run Test"}
            </Button>
            {testResult !== null && (
              <div className="rounded bg-muted p-3 text-center">
                <span className="text-xs text-muted-foreground">Score: </span>
                <span className={`text-lg font-bold ${testResult.score >= 1 ? "text-emerald-600" : "text-destructive"}`}>
                  {testResult.score}
                </span>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
