"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";

export default function OrganizationDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    api
      .get("/org/dashboard")
      .then((res) => setData(res.data))
      .catch(() => notify("Failed to load organization dashboard", "error"))
      .finally(() => setLoading(false));
  }, [notify]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-slate-300">Loading organization dashboard...</div>
      </main>
    );
  }

  const stats = data?.stats || { totalEmails: 0, todayEmails: 0, dailyLimit: 100 };

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-semibold">Organization Dashboard</h1>
      <p className="mt-2 text-sm text-slate-300">{data?.organization?.name || "Organization"} overview</p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Emails Sent" value={stats.totalEmails} />
        <StatCard title="Today Emails" value={stats.todayEmails} />
        <StatCard title="Daily Limit" value={stats.dailyLimit} />
      </div>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
