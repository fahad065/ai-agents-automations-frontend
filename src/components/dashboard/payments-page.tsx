"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  DollarSign, TrendingUp, TrendingDown, Zap,
  ChevronLeft, ChevronRight, Loader2, Filter,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface BillingRecord {
  _id: string;
  userId?: { name: string; email: string };
  moduleType: string;
  moduleName: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  billingDate: string;
  apiCosts?: { openai?: number; seedance?: number; atlas?: number };
}

interface ProfitLoss {
  revenue: number;
  costs: number;
  profit: number;
  apiBreakdown: { openai: number; seedance: number; atlas: number };
}

interface ApiCosts {
  totalAmount: number;
  totalOpenAI: number;
  totalSeedance: number;
  totalAtlas: number;
  count: number;
}

// ── Mini Bar Chart ────────────────────────────────────────────
function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="mb-1.25 flex justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">${value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-sm bg-border">
        <div className="h-full rounded-sm transition-[width] duration-500 ease-out" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, loading }: { label: string; value: string; sub?: string; icon: any; color: string; loading: boolean }) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4.5">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-lg border" style={{ background: `${color}15`, borderColor: `${color}25` }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      {loading ? (
        <div className="h-7 w-1/2 animate-pulse rounded-md bg-border" />
      ) : (
        <p className="text-[22px] font-bold text-foreground">{value}</p>
      )}
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function PaymentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") router.push("/dashboard");
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);
  const [apiCosts, setApiCosts] = useState<ApiCosts | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(() => {
    // Default to current month
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const limit = 10;

  useEffect(() => { fetchAll(); }, [startDate, endDate]);
  useEffect(() => { fetchRecords(); }, [page, startDate, endDate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = `startDate=${startDate}&endDate=${endDate}`;
      const [plRes, acRes, sumRes] = await Promise.all([
        api.get(`/billing/profit-loss?${params}`),
        api.get(`/billing/api-costs?${params}`),
        api.get("/billing/summary"),
      ]);
      setProfitLoss(plRes.data);
      setApiCosts(acRes.data);
      setSummary(sumRes.data);
    } catch {}
    setLoading(false);
  };

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await api.get(`/billing?${params}`);
      setRecords(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);
  const maxApiCost = Math.max(
    apiCosts?.totalOpenAI || 0,
    apiCosts?.totalSeedance || 0,
    apiCosts?.totalAtlas || 0,
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Payment Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform-wide billing, API costs and profit/loss.</p>
        </div>

        {/* Date range filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={13} className="text-muted-foreground" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border bg-background px-2.5 py-1.75 text-xs text-foreground outline-none"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border bg-background px-2.5 py-1.75 text-xs text-foreground outline-none"
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Revenue" value={`$${(profitLoss?.revenue || 0).toFixed(2)}`}
          sub="From subscriptions" icon={DollarSign} color="#22c55e" loading={loading} />
        <StatCard label="Total API Costs" value={`$${(apiCosts?.totalAmount || 0).toFixed(2)}`}
          sub={`${apiCosts?.count || 0} transactions`} icon={Zap} color="#f59e0b" loading={loading} />
        <StatCard
          label="Net Profit/Loss"
          value={`${(profitLoss?.profit || 0) >= 0 ? "+" : ""}$${(profitLoss?.profit || 0).toFixed(2)}`}
          sub="Revenue minus costs" icon={(profitLoss?.profit ?? 0) >= 0 ? TrendingUp : TrendingDown}
          color={(profitLoss?.profit ?? 0) >= 0 ? "#22c55e" : "#ef4444"}
          loading={loading} />
        <StatCard label="This Month" value={`$${(summary?.grandTotal || 0).toFixed(2)}`}
          sub={summary?.month || "—"} icon={BarChart3} color="#7c3aed" loading={loading} />
      </div>

      {/* Two column — API costs + top modules */}
      <div className="mb-5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {/* API Cost Breakdown */}
        <div className="rounded-xl border bg-card px-5 py-4.5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">API Cost Breakdown</h2>
          {loading ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : (
            <>
              <MiniBar label="OpenAI" value={apiCosts?.totalOpenAI || 0} max={maxApiCost} color="#22c55e" />
              <MiniBar label="Seedance (Atlas)" value={apiCosts?.totalSeedance || 0} max={maxApiCost} color="#7c3aed" />
              <MiniBar label="Atlas Cloud" value={apiCosts?.totalAtlas || 0} max={maxApiCost} color="#f59e0b" />
              <div className="mt-1 flex justify-between border-t pt-3">
                <span className="text-[13px] font-semibold text-foreground">Total</span>
                <span className="text-[13px] font-bold text-[#f59e0b]">${(apiCosts?.totalAmount || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Top modules by revenue */}
        <div className="rounded-xl border bg-card px-5 py-4.5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Revenue by Module</h2>
          {loading ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : !summary?.byModule?.length ? (
            <p className="text-[13px] text-muted-foreground">No revenue data yet</p>
          ) : (
            <>
              {summary.byModule.map((m: any, i: number) => (
                <MiniBar key={i} label={m.moduleName} value={m.total}
                  max={summary.byModule[0]?.total || 1} color="#a78bfa" />
              ))}
              <div className="mt-1 flex justify-between border-t pt-3">
                <span className="text-[13px] font-semibold text-foreground">Total</span>
                <span className="text-[13px] font-bold text-[#22c55e]">${(summary?.grandTotal || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent transactions table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-4.5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
        </div>

        {records.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[13px] text-muted-foreground">No transactions found for this period</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="whitespace-normal">
                    <p className="text-[13px] font-medium text-foreground">{r.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(r.billingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {(r.userId as any)?.name || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.moduleName}</TableCell>
                  <TableCell>
                    <span className="inline-block rounded-md bg-primary/8 px-1.75 py-0.75 text-[11px] font-semibold text-[#a78bfa] capitalize">
                      {r.type}
                    </span>
                  </TableCell>
                  <TableCell className={cn("text-[13px] font-bold", r.type === "refund" ? "text-[#22c55e]" : "text-foreground")}>
                    {r.type === "refund" ? "+" : ""}${r.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.75 text-[11px] font-semibold",
                        r.status === "paid" ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#f59e0b]/10 text-[#f59e0b]"
                      )}
                    >
                      {r.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4.5 py-3">
            <p className="text-xs text-muted-foreground">
              {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={13} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
