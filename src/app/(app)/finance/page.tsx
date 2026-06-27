"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────
interface Account {
  id: string; name: string; type: string; currency: string;
  balance: number; color: string; isDefault: boolean;
}
interface Transaction {
  id: string; accountId: string; type: string; amount: number;
  title: string; notes?: string; category: string; date: string; tags: string[];
  account: { name: string; color: string };
}
interface Budget { id: string; category: string; amount: number; period: string; color: string; spent: number }
interface Stats { income: number; expenses: number; net: number; netWorth: number; topCategories: { category: string; amount: number }[] }
interface MonthlyBar { month: string; income: number; expenses: number }

interface FinanceData {
  accounts: Account[];
  transactions: Transaction[];
  stats: Stats;
  monthlyChart: MonthlyBar[];
  budgets: Budget[];
}

// ── Constants ──────────────────────────────────────────────
const ACCOUNT_TYPES = ["CHECKING","SAVINGS","CREDIT_CARD","INVESTMENT","CASH","OTHER"];
const EXPENSE_CATS  = ["Food","Transport","Rent","Utilities","Health","Entertainment","Shopping","Education","Fitness","Travel","Insurance","Other"];
const INCOME_CATS   = ["Salary","Freelance","Investment","Bonus","Gift","Refund","Other"];
const ACCOUNT_COLORS = ["#10b981","#6366f1","#3b82f6","#f59e0b","#ec4899","#8b5cf6"];
const CURRENCIES = ["USD","EUR","GBP","JPY","CAD","AUD","CHF"];

function fmt(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

// ══════════════════════════════════════════════════════════
export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "budgets" | "accounts">("overview");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  // Modals
  const [showAddTx, setShowAddTx]      = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddBudget, setShowAddBudget]   = useState(false);

  // Transaction form
  const [txForm, setTxForm] = useState({
    type: "EXPENSE", amount: "", title: "", category: "Food",
    accountId: "", date: new Date().toISOString().slice(0, 10), notes: "",
  });
  // Account form
  const [acForm, setAcForm] = useState({
    name: "", type: "CHECKING", currency: "USD", balance: "", color: "#10b981", isDefault: false,
  });
  // Budget form
  const [bgForm, setBgForm] = useState({ category: "Food", amount: "", period: "MONTHLY", color: "#6366f1" });

  const [saving, setSaving] = useState(false);
  const [months, setMonths] = useState(1);

  // ── Data ────────────────────────────────────────────────
  const load = useCallback(async () => {
    const res = await fetch(`/api/finance?months=${months}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [months]);
  useEffect(() => { load(); }, [load]);

  const defaultAccountId = data?.accounts.find((a) => a.isDefault)?.id || data?.accounts[0]?.id || "";

  // ── Actions ──────────────────────────────────────────────
  const addTransaction = async () => {
    if (!txForm.amount || !txForm.title) return;
    setSaving(true);
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addTransaction",
        accountId: txForm.accountId || defaultAccountId,
        type: txForm.type,
        amount: parseFloat(txForm.amount),
        title: txForm.title,
        category: txForm.category,
        date: txForm.date,
        notes: txForm.notes || undefined,
      }),
    });
    setShowAddTx(false);
    setTxForm({ type: "EXPENSE", amount: "", title: "", category: "Food", accountId: "", date: new Date().toISOString().slice(0, 10), notes: "" });
    load();
    setSaving(false);
  };

  const deleteTransaction = async (id: string) => {
    await fetch("/api/finance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteTransaction", id }),
    });
    load();
  };

  const addAccount = async () => {
    if (!acForm.name.trim()) return;
    setSaving(true);
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createAccount",
        name: acForm.name,
        type: acForm.type,
        currency: acForm.currency,
        balance: parseFloat(acForm.balance || "0"),
        color: acForm.color,
        isDefault: acForm.isDefault,
      }),
    });
    setShowAddAccount(false);
    setAcForm({ name: "", type: "CHECKING", currency: "USD", balance: "", color: "#10b981", isDefault: false });
    load();
    setSaving(false);
  };

  const addBudget = async () => {
    if (!bgForm.category || !bgForm.amount) return;
    setSaving(true);
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upsertBudget", ...bgForm, amount: parseFloat(bgForm.amount) }),
    });
    setShowAddBudget(false);
    setBgForm({ category: "Food", amount: "", period: "MONTHLY", color: "#6366f1" });
    load();
    setSaving(false);
  };

  // ── Render ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted/50" />)}
      </div>
    );
  }

  const stats = data?.stats ?? { income: 0, expenses: 0, net: 0, netWorth: 0, topCategories: [] };
  const filteredTx = (data?.transactions ?? []).filter((t) =>
    filterType === "ALL" ? true : t.type === filterType
  );
  const maxBar = Math.max(...(data?.monthlyChart ?? []).flatMap((m) => [m.income, m.expenses]), 1);

  const noAccounts = (data?.accounts ?? []).length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Finance</h2>
          <p className="text-sm text-muted-foreground">Track your income, expenses, and net worth</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddAccount(true)}>Add Account</Button>
          <Button size="sm" onClick={() => { setShowAddTx(true); }}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* No accounts state */}
      {noAccounts && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <span className="text-4xl block mb-3">💳</span>
            <h3 className="font-semibold mb-1">Set up your first account</h3>
            <p className="text-sm text-muted-foreground mb-4">Add a bank account or wallet to start tracking your finances.</p>
            <Button onClick={() => setShowAddAccount(true)}>Add Account</Button>
          </CardContent>
        </Card>
      )}

      {!noAccounts && (
        <>
          {/* Net Worth + Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="col-span-2 md:col-span-1 border-primary/20 bg-primary/[0.04]">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Net Worth</div>
                <div className={`text-2xl font-bold ${stats.netWorth >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {fmt(stats.netWorth)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Income (this period)</div>
                <div className="text-2xl font-bold text-green-500">{fmt(stats.income)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Expenses</div>
                <div className="text-2xl font-bold text-red-500">{fmt(stats.expenses)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Net (saved)</div>
                <div className={`text-2xl font-bold ${stats.net >= 0 ? "text-blue-500" : "text-red-500"}`}>
                  {stats.net >= 0 ? "+" : ""}{fmt(stats.net)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2">
            {(["overview","transactions","budgets","accounts"] as const).map((t) => (
              <Button key={t} size="sm"
                variant={activeTab === t ? "default" : "ghost"}
                onClick={() => setActiveTab(t)}
                className="capitalize">{t}</Button>
            ))}
          </div>

          {/* ── OVERVIEW ────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly chart */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Monthly Overview</CardTitle>
                  <select value={months} onChange={(e) => setMonths(Number(e.target.value))}
                    className="text-xs rounded-lg border bg-background px-2 py-1">
                    <option value={1}>This month</option>
                    <option value={3}>Last 3 months</option>
                    <option value={6}>Last 6 months</option>
                  </select>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3 h-40">
                    {(data?.monthlyChart ?? []).map((bar) => (
                      <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5 items-end" style={{ height: "120px" }}>
                          <div className="flex-1 bg-green-500/70 rounded-t-sm"
                            style={{ height: `${(bar.income / maxBar) * 100}%`, minHeight: bar.income > 0 ? "3px" : "0" }} />
                          <div className="flex-1 bg-red-500/70 rounded-t-sm"
                            style={{ height: `${(bar.expenses / maxBar) * 100}%`, minHeight: bar.expenses > 0 ? "3px" : "0" }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/70 inline-block" />Income</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/70 inline-block" />Expenses</span>
                  </div>
                </CardContent>
              </Card>

              {/* Top spending categories */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Top Spending Categories</CardTitle></CardHeader>
                <CardContent>
                  {stats.topCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No expense data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.topCategories.map(({ category, amount }) => {
                        const pct = Math.round((amount / stats.expenses) * 100);
                        return (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{category}</span>
                              <span className="text-muted-foreground">{fmt(amount)} · {pct}%</span>
                            </div>
                            <Progress value={pct} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account balances */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Accounts</CardTitle>
                  <button onClick={() => setActiveTab("accounts")} className="text-xs text-primary hover:underline">Manage</button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data?.accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                        <div>
                          <div className="text-sm font-medium">{acc.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{acc.type.replace("_", " ")}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${acc.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {fmt(acc.balance, acc.currency)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent transactions */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                  <button onClick={() => setActiveTab("transactions")} className="text-xs text-primary hover:underline">See all</button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredTx.slice(0, 6).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
                  ) : (
                    filteredTx.slice(0, 6).map((tx) => (
                      <TxRow key={tx.id} tx={tx} onDelete={deleteTransaction} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── TRANSACTIONS ─────────────────────────────────── */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex gap-2">
                {(["ALL","INCOME","EXPENSE"] as const).map((t) => (
                  <Button key={t} size="sm"
                    variant={filterType === t ? "default" : "outline"}
                    onClick={() => setFilterType(t)}>{t}</Button>
                ))}
              </div>
              {filteredTx.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-10 text-center">
                    <span className="text-3xl block mb-3">💸</span>
                    <p className="text-sm text-muted-foreground">No transactions yet. Add one above.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filteredTx.map((tx) => (
                    <TxRow key={tx.id} tx={tx} onDelete={deleteTransaction} large />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BUDGETS ──────────────────────────────────────── */}
          {activeTab === "budgets" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setShowAddBudget(true)}>+ Add Budget</Button>
              </div>
              {(data?.budgets ?? []).length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <span className="text-4xl block mb-3">📊</span>
                    <h3 className="font-semibold mb-1">No budgets set</h3>
                    <p className="text-sm text-muted-foreground mb-4">Set monthly spending limits per category.</p>
                    <Button onClick={() => setShowAddBudget(true)}>Create Budget</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data!.budgets.map((budget) => {
                    const pct = Math.min(Math.round((budget.spent / budget.amount) * 100), 100);
                    const over = budget.spent > budget.amount;
                    return (
                      <Card key={budget.id}>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.color }} />
                              <span className="font-semibold">{budget.category}</span>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-semibold ${over ? "text-red-500" : "text-foreground"}`}>
                                {fmt(budget.spent)} / {fmt(budget.amount)}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">{budget.period.toLowerCase()}</div>
                            </div>
                          </div>
                          <Progress value={pct} indicatorClassName={over ? "bg-red-500" : "bg-primary"} />
                          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                            <span>{pct}% used</span>
                            <span>{over ? `${fmt(budget.spent - budget.amount)} over` : `${fmt(budget.amount - budget.spent)} left`}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ACCOUNTS ─────────────────────────────────────── */}
          {activeTab === "accounts" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.accounts.map((acc) => (
                <Card key={acc.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: acc.color }} />
                        <div>
                          <div className="font-semibold">{acc.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{acc.type.replace("_"," ")}</div>
                        </div>
                      </div>
                      {acc.isDefault && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                    </div>
                    <div className={`text-3xl font-bold ${acc.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {fmt(acc.balance, acc.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{acc.currency}</div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setShowAddAccount(true)}>
                <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[140px]">
                  <span className="text-2xl mb-2">+</span>
                  <span className="text-sm text-muted-foreground">Add Account</span>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* ── Add Transaction Dialog ────────────────────────── */}
      <Dialog open={showAddTx} onOpenChange={setShowAddTx}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Type toggle */}
            <div className="flex gap-2">
              {["EXPENSE","INCOME","TRANSFER"].map((t) => (
                <Button key={t} size="sm"
                  variant={txForm.type === t ? "default" : "outline"}
                  onClick={() => setTxForm({ ...txForm, type: t,
                    category: t === "INCOME" ? "Salary" : "Food" })}>
                  {t === "EXPENSE" ? "💸" : t === "INCOME" ? "💰" : "↔️"} {t}
                </Button>
              ))}
            </div>
            <Input placeholder="Title *" value={txForm.title} onChange={(e) => setTxForm({ ...txForm, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Amount *</label>
                <Input type="number" placeholder="0.00" min="0" step="0.01"
                  value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Date</label>
                <Input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} />
              </div>
            </div>
            {/* Category */}
            <div>
              <label className="text-xs font-medium block mb-1.5">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {(txForm.type === "INCOME" ? INCOME_CATS : EXPENSE_CATS).map((c) => (
                  <button key={c} onClick={() => setTxForm({ ...txForm, category: c })}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${txForm.category === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {/* Account */}
            {(data?.accounts ?? []).length > 1 && (
              <div>
                <label className="text-xs font-medium block mb-1.5">Account</label>
                <div className="flex flex-wrap gap-2">
                  {data!.accounts.map((a) => (
                    <button key={a.id} onClick={() => setTxForm({ ...txForm, accountId: a.id })}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all border ${(txForm.accountId || defaultAccountId) === a.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-border"}`}>
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Input placeholder="Notes (optional)" value={txForm.notes} onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })} />
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddTx(false)}>Cancel</Button>
              <Button className="flex-1" onClick={addTransaction} disabled={saving || !txForm.amount || !txForm.title}>
                {saving ? "Saving…" : "Add Transaction"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Account Dialog ────────────────────────────── */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Account</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Account name *" value={acForm.name} onChange={(e) => setAcForm({ ...acForm, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Type</label>
                <div className="flex flex-wrap gap-1">
                  {ACCOUNT_TYPES.map((t) => (
                    <button key={t} onClick={() => setAcForm({ ...acForm, type: t })}
                      className={`px-2 py-1 rounded-lg text-xs transition-all ${acForm.type === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                      {t.replace("_"," ")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Currency</label>
                <div className="flex flex-wrap gap-1">
                  {CURRENCIES.map((c) => (
                    <button key={c} onClick={() => setAcForm({ ...acForm, currency: c })}
                      className={`px-2 py-1 rounded-lg text-xs transition-all ${acForm.currency === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Current Balance</label>
              <Input type="number" placeholder="0.00" step="0.01" value={acForm.balance}
                onChange={(e) => setAcForm({ ...acForm, balance: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-2">Color</label>
              <div className="flex gap-2">
                {ACCOUNT_COLORS.map((c) => (
                  <button key={c} onClick={() => setAcForm({ ...acForm, color: c })}
                    className={`w-7 h-7 rounded-full transition-all ${acForm.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={acForm.isDefault}
                onChange={(e) => setAcForm({ ...acForm, isDefault: e.target.checked })}
                className="rounded" />
              <span className="text-sm">Set as default account</span>
            </label>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddAccount(false)}>Cancel</Button>
              <Button className="flex-1" onClick={addAccount} disabled={saving || !acForm.name.trim()}>
                {saving ? "Saving…" : "Add Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Budget Dialog ─────────────────────────────── */}
      <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Set Budget</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {EXPENSE_CATS.map((c) => (
                  <button key={c} onClick={() => setBgForm({ ...bgForm, category: c })}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${bgForm.category === c ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Budget Limit</label>
                <Input type="number" placeholder="e.g. 500" min="1" step="1"
                  value={bgForm.amount} onChange={(e) => setBgForm({ ...bgForm, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Period</label>
                <div className="flex gap-1">
                  {["WEEKLY","MONTHLY","YEARLY"].map((p) => (
                    <Button key={p} size="sm" variant={bgForm.period === p ? "default" : "outline"}
                      onClick={() => setBgForm({ ...bgForm, period: p })} className="text-xs px-2 h-8">
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddBudget(false)}>Cancel</Button>
              <Button className="flex-1" onClick={addBudget} disabled={saving || !bgForm.amount}>
                {saving ? "Saving…" : "Set Budget"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Transaction Row Component ──────────────────────────────
function TxRow({ tx, onDelete, large }: { tx: Transaction; onDelete: (id: string) => void; large?: boolean }) {
  return (
    <div className={`group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors ${large ? "border" : ""}`}>
      {/* Type indicator */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
        tx.type === "INCOME" ? "bg-green-500/15 text-green-500" :
        tx.type === "EXPENSE" ? "bg-red-500/15 text-red-500" :
        "bg-blue-500/15 text-blue-500"
      }`}>
        {tx.type === "INCOME" ? "↑" : tx.type === "EXPENSE" ? "↓" : "↔"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{tx.title}</span>
          <Badge variant="secondary" className="text-[10px] shrink-0">{tx.category}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{tx.account.name}</span>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-semibold text-sm ${tx.type === "INCOME" ? "text-green-500" : tx.type === "EXPENSE" ? "text-red-500" : "text-blue-500"}`}>
          {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
          {fmt(tx.amount)}
        </div>
      </div>
      <button onClick={() => onDelete(tx.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
