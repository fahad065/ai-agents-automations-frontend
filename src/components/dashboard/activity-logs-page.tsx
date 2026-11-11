"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { Loader2, ChevronLeft, ChevronRight, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Mirrors ActivityLogsService's responses (GET /activity-logs/my,
// GET /activity-logs/admin) — see backend ai/architecture.md's
// activity_logs section. `userId`/`actorId` come back populated
// ({_id, name, email[, role]}) rather than bare ObjectIds.
interface ActivityLogRow {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  actorId: { _id: string; name: string; email: string; role?: string } | string;
  actorRole: "user" | "admin";
  action: "create" | "update" | "delete";
  entityType: string;
  entityId?: string;
  description: string;
  createdAt: string;
}

const ACTION_COLOR: Record<string, string> = {
  create: "bg-[#22c55e]/10 text-[#22c55e]",
  update: "bg-primary/10 text-[#a78bfa]",
  delete: "bg-destructive/10 text-destructive",
};

const ENTITY_TYPES = ["chatbot", "knowledge_base", "apikey", "usermodule", "user"];
const ACTIONS = ["create", "update", "delete"];

function personLabel(p: ActivityLogRow["userId"] | ActivityLogRow["actorId"]) {
  if (!p) return "—";
  if (typeof p === "string") return p;
  return p.name || p.email || "—";
}

export function ActivityLogsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [rows, setRows] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Admin-only filters
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (entityType) params.set("entityType", entityType);
        if (action) params.set("action", action);
        if (userIdFilter.trim()) params.set("userId", userIdFilter.trim());
        const res = await api.get(`/activity-logs/admin?${params}`);
        setRows(res.data?.items || []);
        setTotal(res.data?.total || 0);
      } else {
        const res = await api.get(`/activity-logs/my?page=${page}&limit=${limit}`);
        setRows(res.data?.items || []);
        setTotal(res.data?.total || 0);
      }
    } catch {
      setRows([]);
      setTotal(0);
    }
    setLoading(false);
  }, [isAdmin, page, entityType, action, userIdFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Every create/update/delete across every account — including actions taken on a client's behalf."
            : "A record of every change made on your account — by you, or by an admin on your behalf."}
        </p>
      </div>

      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Filter by user id…"
            value={userIdFilter}
            onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
            className="max-w-[220px]"
          />
          <Combobox
            value={entityType}
            onChange={(v) => { setEntityType(v); setPage(1); }}
            options={ENTITY_TYPES.map((t) => ({ value: t, label: t.replace("_", " ") }))}
            placeholder="All modules"
            searchPlaceholder="Search modules..."
            className="w-auto min-w-[160px]"
          />
          <Combobox
            value={action}
            onChange={(v) => { setAction(v); setPage(1); }}
            options={ACTIONS.map((a) => ({ value: a, label: a }))}
            placeholder="All actions"
            searchPlaceholder="Search actions..."
            className="w-auto min-w-[150px]"
          />
          <span className="text-xs text-muted-foreground">{total} entries</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Account</TableHead>}
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-sm text-muted-foreground">
                      <History className="mx-auto mb-2 size-6 text-muted-foreground/60" />
                      No activity yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r._id}>
                      {isAdmin && (
                        <TableCell>
                          <p className="text-sm font-medium text-foreground">{personLabel(r.userId)}</p>
                          {typeof r.userId !== "string" && (
                            <p className="text-xs text-muted-foreground">{r.userId.email}</p>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", ACTION_COLOR[r.action])}>
                          {r.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{r.entityType.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{r.description}</TableCell>
                      <TableCell className="text-sm">
                        <span className={r.actorRole === "admin" ? "font-medium text-[#a78bfa]" : "text-muted-foreground"}>
                          {personLabel(r.actorId)}
                          {r.actorRole === "admin" && " (admin)"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex size-8 items-center justify-center rounded-md border bg-background text-foreground disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex size-8 items-center justify-center rounded-md border bg-background text-foreground disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
