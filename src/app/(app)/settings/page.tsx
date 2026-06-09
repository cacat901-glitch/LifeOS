"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "appearance", label: "Appearance" },
    { id: "notifications", label: "Notifications" },
    { id: "privacy", label: "Privacy" },
    { id: "subscription", label: "Subscription" },
    { id: "data", label: "Data & Export" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your preferences and account</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                size="sm"
                className="justify-start whitespace-nowrap"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "privacy" && <PrivacySettings />}
          {activeTab === "subscription" && <SubscriptionSettings />}
          {activeTab === "data" && <DataSettings />}
          {activeTab === "account" && <AccountSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
            U
          </div>
          <Button variant="outline" size="sm">Change Photo</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input defaultValue="john@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <Input defaultValue="America/New_York" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input defaultValue="New York, USA" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea
            className="w-full h-20 px-3 py-2 rounded-xl border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue="Building a better life, one habit at a time."
          />
        </div>
        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState("dark");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how LifeOS looks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Theme</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Light", icon: "☀️" },
              { id: "dark", label: "Dark", icon: "🌙" },
              { id: "system", label: "System", icon: "💻" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  theme === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-2xl block mb-1">{t.icon}</span>
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Accent Color</h4>
          <div className="flex gap-3">
            {["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-foreground/30 transition-all"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: "Email Notifications", description: "Receive weekly digest and important updates", defaultChecked: true },
          { label: "Habit Reminders", description: "Get reminded about incomplete habits", defaultChecked: true },
          { label: "Goal Reminders", description: "Notifications about approaching deadlines", defaultChecked: true },
          { label: "Task Reminders", description: "Reminders for tasks due today", defaultChecked: true },
          { label: "Workout Reminders", description: "Daily workout schedule notifications", defaultChecked: false },
          { label: "Weekly Digest", description: "Summary of your week every Sunday", defaultChecked: true },
          { label: "Achievement Alerts", description: "Get notified when you unlock achievements", defaultChecked: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50">
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}

function PrivacySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
        <CardDescription>Control your data and privacy settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: "Public Profile", description: "Allow others to see your achievements", defaultChecked: false },
          { label: "Show Achievements", description: "Display achievements on your timeline", defaultChecked: true },
          { label: "Data Analytics", description: "Help us improve with anonymous usage data", defaultChecked: false },
          { label: "AI Data Usage", description: "Allow AI to analyze your patterns for insights", defaultChecked: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50">
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
        <Button>Save Privacy Settings</Button>
      </CardContent>
    </Card>
  );
}

function SubscriptionSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your plan and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Pro Plan</h4>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">$9.99/month • Renews July 9, 2026</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Plan Features</h4>
          <ul className="space-y-2">
            {[
              "Unlimited habits",
              "Unlimited journal entries",
              "Advanced analytics",
              "AI Insights",
              "Life Timeline",
              "Data export",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Change Plan</Button>
          <Button variant="ghost" className="text-destructive">Cancel Subscription</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DataSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data & Export</CardTitle>
        <CardDescription>Export or manage your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="p-4 rounded-xl border">
            <h4 className="font-medium text-sm">Export All Data</h4>
            <p className="text-xs text-muted-foreground mt-1">Download all your data in JSON format</p>
            <Button variant="outline" size="sm" className="mt-3">Export JSON</Button>
          </div>
          <div className="p-4 rounded-xl border">
            <h4 className="font-medium text-sm">Export Journal Entries</h4>
            <p className="text-xs text-muted-foreground mt-1">Download journal entries as Markdown files</p>
            <Button variant="outline" size="sm" className="mt-3">Export Markdown</Button>
          </div>
          <div className="p-4 rounded-xl border">
            <h4 className="font-medium text-sm">Export Statistics</h4>
            <p className="text-xs text-muted-foreground mt-1">Download analytics data as CSV</p>
            <Button variant="outline" size="sm" className="mt-3">Export CSV</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20">
            <div>
              <h4 className="font-medium text-sm">Delete Account</h4>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
