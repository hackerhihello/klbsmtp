"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ToastProvider";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalOrgs: 0, blockedOrgs: 0, emailsSentToday: 0 });
  const { notify } = useToast();

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => notify("Unable to load dashboard stats", "error"));
  }, [notify]);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Organizations" value={stats.totalOrgs} />
        <StatCard title="Blocked Organizations" value={stats.blockedOrgs} />
        <StatCard title="Emails Sent Today" value={stats.emailsSentToday} />
      </div>
      <p className="mt-6 text-sm text-slate-300">Create organizations, assign API keys, and monitor delivery from the sidebar.</p>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
