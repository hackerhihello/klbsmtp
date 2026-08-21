"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [emailsSentToday, setEmailsSentToday] = useState(0);
  const [filters, setFilters] = useState({
    orgId: "",
    status: "",
    email: "",
    from: "",
    to: ""
  });
  const { notify } = useToast();

  const loadLogs = async () => {
    try {
      const params = {};
      if (filters.orgId) params.orgId = filters.orgId;
      if (filters.status) params.status = filters.status;
      if (filters.email) params.email = filters.email;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await api.get("/admin/logs", { params });
      setLogs(res.data.logs || []);
      setEmailsSentToday(res.data.emailsSentToday || 0);
    } catch {
      notify("Failed to load logs", "error");
    }
  };

  useEffect(() => {
    api
      .get("/admin/orgs")
      .then((res) => setOrgs(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.orgId, filters.status, filters.email, filters.from, filters.to]);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Email Logs</h1>
      <p className="mt-2 text-sm text-slate-300">Emails sent today: {emailsSentToday}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <select
          className="rounded bg-slate-800 p-2"
          value={filters.orgId}
          onChange={(e) => setFilters((prev) => ({ ...prev, orgId: e.target.value }))}
        >
          <option value="">All organizations</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <select
          className="rounded bg-slate-800 p-2"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="success">success</option>
          <option value="failed">failed</option>
        </select>
        <input
          className="rounded bg-slate-800 p-2"
          placeholder="Recipient email"
          value={filters.email}
          onChange={(e) => setFilters((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          className="rounded bg-slate-800 p-2"
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
        />
        <input
          className="rounded bg-slate-800 p-2"
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
        />
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-3">Organization</th>
              <th className="p-3">To</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
              <th className="p-3">Attempts</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-800">
                <td className="p-3">{log.organization?.name || "-"}</td>
                <td className="p-3">{log.email}</td>
                <td className="p-3">{log.subject}</td>
                <td className="p-3">{log.status}</td>
                <td className="p-3">{log.attempts}</td>
                <td className="p-3">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
