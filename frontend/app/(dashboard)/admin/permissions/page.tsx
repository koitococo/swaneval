"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useRoleConfigs, usePermissionGroups, useCreatePermissionGroup, useDeletePermissionGroup } from "@/lib/hooks/use-permissions";
import { extractErrorDetail } from "@/lib/utils";

const permLabel: Record<string, string> = {
  "datasets.read": "数据集 · 查看",
  "datasets.write": "数据集 · 编辑",
  "datasets.download": "数据集 · 下载",
  "models.read": "模型 · 查看",
  "models.write": "模型 · 编辑",
  "criteria.read": "标准 · 查看",
  "criteria.write": "标准 · 编辑",
  "tasks.read": "任务 · 查看",
  "tasks.create": "任务 · 创建",
  "tasks.manage": "任务 · 管理",
  "results.read": "结果 · 查看",
  "reports.read": "报告 · 查看",
  "reports.generate": "报告 · 生成",
  "reports.export": "报告 · 导出",
  "clusters.read": "集群 · 查看",
  "clusters.manage": "集群 · 管理",
  "admin.users": "管理 · 用户",
  "admin.groups": "管理 · 权限组",
  "admin.acl": "管理 · ACL",
};

export default function PermissionsPage() {
  const { data: roleConfigs = [] } = useRoleConfigs();
  const { data: permGroups = [] } = usePermissionGroups();
  const createGroup = useCreatePermissionGroup();
  const deleteGroup = useDeletePermissionGroup();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPerms, setNewPerms] = useState<Set<string>>(new Set());
  const [createError, setCreateError] = useState("");

  const handleCreate = async () => {
    setCreateError("");
    try {
      await createGroup.mutateAsync({
        name: newName,
        description: newDesc || undefined,
        permissions: Array.from(newPerms),
      });
      setShowCreate(false);
      setNewName(""); setNewDesc(""); setNewPerms(new Set());
    } catch (err: unknown) {
      setCreateError(extractErrorDetail(err, "创建失败"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">权限管理</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          角色提供基础权限，权限组可在角色之上叠加额外能力
        </p>
      </div>

      {/* Preset roles */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">预设角色</h2>
        <div className="grid grid-cols-2 gap-3">
          {roleConfigs.map((role) => (
            <Card key={role.name}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{role.label}</span>
                  <Badge variant={role.name === "admin" ? "default" : "outline"} className="text-[10px]">
                    {role.name}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">
                      {permLabel[p] || p}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom permission groups */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">自定义权限组</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              将用户加入权限组可赋予其角色默认权限之外的额外能力
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" />
            新建权限组
          </Button>
        </div>
        {permGroups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              暂无自定义权限组
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {permGroups.map((g) => (
              <Card key={g.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{g.name}</span>
                      {g.is_system && <Badge variant="outline" className="text-[10px]">系统</Badge>}
                      <span className="text-[10px] text-muted-foreground">{g.member_count} 位成员</span>
                    </div>
                    {!g.is_system && (
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteGroup.mutate(g.id)}
                        disabled={deleteGroup.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  {g.description && <p className="text-[11px] text-muted-foreground">{g.description}</p>}
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(g.permissions) ? g.permissions : []).map((p: string) => (
                      <Badge key={p} variant="secondary" className="text-[10px]">
                        {permLabel[p] || p}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>新建权限组</DialogTitle>
            <DialogDescription>选择权限并创建自定义权限组</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">名称<span className="text-destructive ml-0.5">*</span></Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="例：高级工程师" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">描述</Label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="可选描述" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">权限 ({newPerms.size} 项已选)</Label>
              <div className="rounded-md border p-3 grid grid-cols-2 gap-1.5 max-h-48 overflow-auto">
                {Object.entries(permLabel).map(([perm, label]) => (
                  <label key={perm} className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={newPerms.has(perm)}
                      onChange={(e) => {
                        const next = new Set(newPerms);
                        if (e.target.checked) next.add(perm); else next.delete(perm);
                        setNewPerms(next);
                      }}
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
            <Button disabled={createGroup.isPending || !newName || newPerms.size === 0} onClick={handleCreate}>
              {createGroup.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
