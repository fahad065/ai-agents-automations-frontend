"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { Search, Loader2, Activity, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// Mirrors AdminService.getUsagePerTenant()'s response shape
// (GET /admin/usage, backend CLAUDE.md's "Per-tenant usage/error
// monitoring" section) — the agents/automations analog of the `usage`
// field GET /chatbots/admin/all already returns per bot.
interface TenantUsage {
  userId: string;
  name: string;
  email: string;
  planType?: string;
  trialEndDate?: string;
  isActive?: boolean;
  modulesByStatus: Record<string, number>;
  pipelines: {
    totalRuns: number;
    failedRuns: number;
    lastRunAt: string | null;
    runs30d: number;
    failedRuns30d: number;
  };
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trial: "Trial",
  expired: "Expired",
  cancelled: "Cancelled",
};

export function UsagePage() {
  const [rows, setRows] = useState<TenantUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/usage");
        setRows(res.data || []);
      } catch {
        setRows([]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          runs: acc.runs + r.pipelines.totalRuns,
          failed: acc.failed + r.pipelines.failedRuns,
          runs30d: acc.runs30d + r.pipelines.runs30d,
        }),
        { runs: 0, failed: 0, runs30d: 0 },
      ),
    [rows],
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Usage & Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Per-tenant pipeline activity for agents/automations — how each customer is actually using the platform, not just global totals. Chatbot message volume is on each bot's own card in the Chatbots admin list.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total pipeline runs</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totals.runs}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Runs, last 30 days</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totals.runs30d}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Failed runs (all-time)</p>
          <p className={`mt-1 text-2xl font-bold ${totals.failed > 0 ? "text-destructive" : "text-foreground"}`}>
            {totals.failed}
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search name, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Runs (30d / total)</TableHead>
                <TableHead>Failed (30d / total)</TableHead>
                <TableHead>Last Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No matching users.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.userId}>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{r.planType || "—"}</Badge>
                      {r.trialEndDate && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Trial ends {new Date(r.trialEndDate).toLocaleDateString()}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(r.modulesByStatus).length === 0 ? (
                          <span className="text-xs text-muted-foreground">None</span>
                        ) : (
                          Object.entries(r.modulesByStatus).map(([status, count]) => (
                            <Badge key={status} variant="secondary" className="text-[10px]">
                              {STATUS_LABEL[status] || status}: {count}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="font-medium text-foreground">{r.pipelines.runs30d}</span>
                      <span className="text-muted-foreground"> / {r.pipelines.totalRuns}</span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.pipelines.failedRuns > 0 ? (
                        <span className="inline-flex items-center gap-1 font-medium text-destructive">
                          <AlertCircle className="size-3.5" />
                          {r.pipelines.failedRuns30d} / {r.pipelines.failedRuns}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0 / 0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.pipelines.lastRunAt ? (
                        <span className="inline-flex items-center gap-1">
                          <Activity className="size-3" />
                          {new Date(r.pipelines.lastRunAt).toLocaleDateString()}
                        </span>
                      ) : (
                        "Never"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
