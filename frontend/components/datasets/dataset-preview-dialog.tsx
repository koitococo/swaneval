"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useDatasetPreview } from "@/lib/hooks/use-datasets";

interface DatasetPreviewDialogProps {
  datasetId: string | null;
  onClose: () => void;
}

export function DatasetPreviewDialog({ datasetId, onClose }: DatasetPreviewDialogProps) {
  const preview = useDatasetPreview(datasetId ?? "", !!datasetId);
  const [expandedCell, setExpandedCell] = useState<{ row: number; col: string } | null>(null);

  const rows = preview.data?.rows ?? [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const expandedValue = expandedCell
    ? String(rows[expandedCell.row]?.[expandedCell.col] ?? "")
    : "";

  return (
    <Dialog open={!!datasetId} onOpenChange={() => { onClose(); setExpandedCell(null); }}>
      <DialogContent className="sm:max-w-[90vw] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>数据集预览</DialogTitle>
              <DialogDescription>
                {preview.data ? `显示 ${rows.length} / ${preview.data.total} 行 · ${columns.length} 列` : "加载中..."}
              </DialogDescription>
            </div>
            {columns.length > 0 && (
              <div className="flex gap-1">
                {columns.map((col) => (
                  <Badge key={col} variant="secondary" className="text-[10px]">{col}</Badge>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 pb-6 min-h-0">
          {preview.isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              加载中...
            </div>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">暂无数据</p>
          ) : expandedCell ? (
            /* Expanded single cell view */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">行 {expandedCell.row + 1}</Badge>
                  <Badge variant="secondary" className="text-xs font-mono">{expandedCell.col}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setExpandedCell(null)}>
                  <X className="h-3.5 w-3.5 mr-1" /> 返回表格
                </Button>
              </div>
              <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-sm font-mono max-h-[60vh] overflow-auto">
                {expandedValue}
              </pre>
            </div>
          ) : (
            /* Table view */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  {columns.map((col) => (
                    <TableHead key={col} className="min-w-[120px]">{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i} className="hover:bg-muted/50">
                    <TableCell className="text-center text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                    {columns.map((col) => {
                      const val = String(row[col] ?? "");
                      const isLong = val.length > 80;
                      return (
                        <TableCell
                          key={col}
                          className={`max-w-xs text-xs ${isLong ? "cursor-pointer hover:text-primary" : ""}`}
                          onClick={() => isLong && setExpandedCell({ row: i, col })}
                          title={isLong ? "点击查看完整内容" : undefined}
                        >
                          <span className="line-clamp-2">{val || <span className="text-muted-foreground/40">—</span>}</span>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
