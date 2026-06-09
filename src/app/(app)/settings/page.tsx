"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface UserData {
  id: string; name: string; email: string; bio?: string; location?: string; timezone?: string;
  image?: string; xp: number; level: number; title: string;
  settings?: { theme: string; emailNotifications: boolean; habitReminders: boolean; goalReminders: boolean; taskReminders: boolean; workoutReminders: boolean; weeklyDigest: boolean };
  subscription?: { plan: string; status: string };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user").then((r) => r.json()).then((d) => { setUser(d); setLoading(false); });
  }, []);

  const tabs = [
    { id: "profile", label: "Profile" }, { id: "appearance", label: "Appearance" },
    { id: "notifications", label: "Notifications" }, { id: "subscription", label: "Subscription" },
    { id: "data", label: "Data & Export" }, { id: "account", label: "Account" },
  ];

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted/50" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="text-2xl font-bold">Settings</h2><p className="text-sm text-muted-foreground">Manage your account and preferences</p></div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((t) => (
              <Button key={t.id} variant={activeTab === t.id ? "secondary" : "ghost"} size="sm"
                className="justify-start whitespace-nowrap" onClick={() => setActiveTab(t.id)}>{t.label}</Button>
            ))}
          </nav>
        </div>
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && <ProfileTab user={user} onUpdate={setUser} />}
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "notifications" && <NotificationsTab user={user} onUpdate={setUser} />}
          {activeTab === "subscription" && <SubscriptionTab user={user} />}
          {activeTab === "data" && <DataTab />}
          {activeTab === "account" && <AccountTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user, onUpdate }: { user: UserData | null; onUpdate: (u: any) => void }) {
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "", location: user?.location || "", timezone: user?.timezone || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Update your personal information</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary" className="text-xs mt-1">Level {user?.level} · {user?.title}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Full Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Location</label><Input placeholder="City, Country" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Timezone</label><Input placeholder="UTC" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full h-20 px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" placeholder="A little about you…" />
        </div>
        <Button onClick={save} disabled={saving}>{saved ? "✓ Saved!" : saving ? "Saving…" : "Save Changes"}</Button>
      </CardContent>
    </Card>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  return (
    <Card>
      <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize how LifeOS looks</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Theme</h4>
          <div className="grid grid-cols-3 gap-3">
            {[{ id: "light", label: "Light", icon: "☀️" }, { id: "dark", label: "Dark", icon: "🌙" }, { id: "system", label: "System", icon: "💻" }].map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border text-center transition-all ${theme === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <span className="text-2xl block mb-1">{t.icon}</span>
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab({ user, onUpdate }: { user: UserData | null; onUpdate: (u: any) => void }) {
  const s = user?.settings;
  const [form, setForm] = useState({
    emailNotifications: s?.emailNotifications ?? true,
    habitReminders: s?.habitReminders ?? true,
    goalReminders: s?.goalReminders ?? true,
    taskReminders: s?.taskReminders ?? true,
    workoutReminders: s?.workoutReminders ?? false,
    weeklyDigest: s?.weeklyDigest ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: form }) });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const items = [
    { key: "emailNotifications", label: "Email Notifications", desc: "Receive weekly digest and important updates" },
    { key: "habitReminders", label: "Habit Reminders", desc: "Get reminded about incomplete habits" },
    { key: "goalReminders", label: "Goal Reminders", desc: "Notifications about approaching deadlines" },
    { key: "taskReminders", label: "Task Reminders", desc: "Reminders for tasks due today" },
    { key: "workoutReminders", label: "Workout Reminders", desc: "Daily workout schedule notifications" },
    { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary of your week every Sunday" },
  ] as const;

  return (
    <Card>
      <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50">
            <div><div className="text-sm font-medium">{item.label}</div><div className="text-xs text-muted-foreground">{item.desc}</div></div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form[item.key]} onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
        <Button className="mt-2" onClick={save} disabled={saving}>{saved ? "✓ Saved!" : saving ? "Saving…" : "Save Preferences"}</Button>
      </CardContent>
    </Card>
  );
}

function SubscriptionTab({ user }: { user: UserData | null }) {
  const plan = user?.subscription?.plan || "FREE";
  const isPro = plan === "PRO";

  return (
    <Card>
      <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className={`p-4 rounded-xl border ${isPro ? "border-primary/30 bg-primary/5" : "border-border"}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2"><h4 className="font-semibold">{plan} Plan</h4><Badge variant={isPro ? "default" : "secondary"}>{user?.subscription?.status || "Active"}</Badge></div>
              <p className="text-sm text-muted-foreground mt-1">{isPro ? "$9.99/month" : "Free forever"}</p>
            </div>
          </div>
        </div>
        {!isPro && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Unlock with Pro</h4>
            {["Unlimited habits","Unlimited journals","Advanced analytics","AI Insights","Life Timeline","Data export"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {f}
              </div>
            ))}
            <Button className="w-full mt-2" onClick={async () => {
              const res = await fetch("/api/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "checkout" }) });
              if (res.ok) { const { url } = await res.json(); if (url) window.location.href = url; }
            }}>Upgrade to Pro — $9.99/month</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AccountTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const changePassword = async () => {
    if (form.newPassword !== form.confirmPassword) { setMsg("Passwords don't match"); return; }
    if (form.newPassword.length < 8) { setMsg("Password must be at least 8 characters"); return; }
    setSaving(true);
    const res = await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
    const d = await res.json();
    setMsg(res.ok ? "Password updated!" : d.error || "Failed");
    if (res.ok) setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const deleteAccount = async () => {
    if (!confirm("This will permanently delete your account and all data. Are you sure?")) return;
    if (!confirm("This action CANNOT be undone. Type 'DELETE' to confirm.")) return;
    await fetch("/api/user", { method: "DELETE" });
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes("updated") ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>{msg}</div>}
          <div className="space-y-1.5"><label className="text-sm font-medium">Current Password</label><Input type="password" placeholder="••••••••" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">New Password</label><Input type="password" placeholder="••••••••" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Confirm New Password</label><Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></div>
          <Button onClick={changePassword} disabled={saving}>{saving ? "Saving…" : "Update Password"}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-muted-foreground">Sign Out</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
        </CardContent>
      </Card>
      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle><CardDescription>Irreversible actions</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20">
            <div><h4 className="font-medium text-sm">Delete Account</h4><p className="text-xs text-muted-foreground">Permanently delete your account and all data</p></div>
            <Button variant="destructive" size="sm" onClick={deleteAccount}>Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function DataTab() {
  const download = (type: string, data?: string) => {
    const url = data ? `/api/export?type=csv&data=${data}` : `/api/export?type=${type}`;
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data &amp; Export</CardTitle>
        <CardDescription>Download a copy of your data anytime. Your data belongs to you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { title: "Export Everything (JSON)", desc: "All your data: habits, tasks, goals, journal, workouts, mood, finance, projects.", action: () => download("json"), label: "Download JSON" },
          { title: "Export Journal (Markdown)", desc: "All journal entries formatted as readable Markdown.", action: () => download("markdown"), label: "Download Markdown" },
          { title: "Export Transactions (CSV)", desc: "Finance transaction history for spreadsheet use.", action: () => download("csv", "transactions"), label: "Download CSV" },
          { title: "Export Habits (CSV)", desc: "Habit list with streaks and completion stats.", action: () => download("csv", "habits"), label: "Download CSV" },
          { title: "Export Mood Log (CSV)", desc: "Full mood history with emotions and factors.", action: () => download("csv", "mood"), label: "Download CSV" },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between p-4 rounded-xl border">
            <div>
              <h4 className="font-medium text-sm">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Button variant="outline" size="sm" onClick={item.action} className="shrink-0 ml-4">{item.label}</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
