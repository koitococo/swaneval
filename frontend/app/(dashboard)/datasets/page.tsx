"use client";

import { useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Upload, Trash2, Eye, FolderOpen } from "lucide-react";
import {
  useDatasets,
  useUploadDataset,
  useMountDataset,
  useDeleteDataset,
  useDatasetPreview,
} from "@/lib/hooks/use-datasets";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function DatasetsPage() {
  const { data: datasets = [], isLoading, refetch } = useDatasets();
  const upload = useUploadDataset();
  const mount = useMountDataset();
  const deleteMut = useDeleteDataset();

  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    tags: "",
  });
  const [mountForm, setMountForm] = useState({
    name: "",
    description: "",
    server_path: "",
    format: "jsonl",
    tags: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = useDatasetPreview(previewId ?? "", !!previewId);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    await upload.mutateAsync({
      file,
      name: uploadForm.name || file.name,
      description: uploadForm.description,
      tags: uploadForm.tags,
    });
    setUploadForm({ name: "", description: "", tags: "" });
    setOpen(false);
  };

  const handleMount = async (e: React.FormEvent) => {
    e.preventDefault();
    await mount.mutateAsync({
      name: mountForm.name,
      description: mountForm.description,
      server_path: mountForm.server_path,
      format: mountForm.format,
      tags: mountForm.tags,
    });
    setMountForm({
      name: "",
      description: "",
      server_path: "",
      format: "jsonl",
      tags: "",
    });
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">数据集 Datasets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Dataset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Dataset</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="upload">
              <TabsList className="w-full">
                <TabsTrigger value="upload" className="flex-1">
                  <Upload className="mr-1 h-3.5 w-3.5" /> Upload File
                </TabsTrigger>
                <TabsTrigger value="mount" className="flex-1">
                  <FolderOpen className="mr-1 h-3.5 w-3.5" /> Server Path
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <form onSubmit={handleUpload} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label>File (JSONL / CSV / JSON)</Label>
                    <Input
                      ref={fileRef}
                      type="file"
                      accept=".jsonl,.csv,.json"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        value={uploadForm.name}
                        onChange={(e) =>
                          setUploadForm({ ...uploadForm, name: e.target.value })
                        }
                        placeholder="Defaults to filename"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Tags</Label>
                      <Input
                        value={uploadForm.tags}
                        onChange={(e) =>
                          setUploadForm({ ...uploadForm, tags: e.target.value })
                        }
                        placeholder="math,reasoning"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Input
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={upload.isPending}
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    {upload.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="mount">
                <form onSubmit={handleMount} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label>Server Path</Label>
                    <Input
                      value={mountForm.server_path}
                      onChange={(e) =>
                        setMountForm({
                          ...mountForm,
                          server_path: e.target.value,
                        })
                      }
                      placeholder="/data/datasets/eval.jsonl"
                      className="font-mono"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Absolute path on the server. File will not be copied.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        value={mountForm.name}
                        onChange={(e) =>
                          setMountForm({ ...mountForm, name: e.target.value })
                        }
                        placeholder="Dataset name"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Format</Label>
                      <Input
                        value={mountForm.format}
                        onChange={(e) =>
                          setMountForm({ ...mountForm, format: e.target.value })
                        }
                        placeholder="jsonl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Input
                        value={mountForm.description}
                        onChange={(e) =>
                          setMountForm({
                            ...mountForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Tags</Label>
                      <Input
                        value={mountForm.tags}
                        onChange={(e) =>
                          setMountForm({ ...mountForm, tags: e.target.value })
                        }
                        placeholder="math,reasoning"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={mount.isPending}
                  >
                    <FolderOpen className="mr-1 h-4 w-4" />
                    {mount.isPending ? "Mounting..." : "Mount Path"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Rows</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Ver</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : datasets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No datasets. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                datasets.map((ds) => (
                  <TableRow key={ds.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ds.name}</p>
                        {ds.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {ds.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ds.source_type}</Badge>
                    </TableCell>
                    <TableCell>{ds.format}</TableCell>
                    <TableCell className="text-right font-mono">
                      {ds.row_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatBytes(ds.size_bytes)}
                    </TableCell>
                    <TableCell>
                      {ds.tags &&
                        ds.tags.split(",").map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="mr-1"
                          >
                            {t.trim()}
                          </Badge>
                        ))}
                    </TableCell>
                    <TableCell className="text-right">
                      v{ds.version}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPreviewId(ds.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() =>
                          setDeleteTarget({ id: ds.id, name: ds.name })
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

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Dataset Preview</DialogTitle>
          </DialogHeader>
          {preview.isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Loading...
            </p>
          ) : preview.data?.rows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No rows</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview.data?.rows[0] &&
                      Object.keys(preview.data.rows[0]).map((k) => (
                        <TableHead key={k}>{k}</TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.data?.rows.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((v, j) => (
                        <TableCell key={j} className="max-w-xs truncate">
                          {String(v)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-2 text-xs text-muted-foreground">
                Showing {preview.data?.rows.length} of {preview.data?.total}{" "}
                rows
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Dataset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
