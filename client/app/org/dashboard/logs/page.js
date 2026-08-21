"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import { useToast } from "../../../../components/ToastProvider";

export default function OrganizationLogsPage() {
  const [logs, setLogs] = useState([]);
  const [usage, setUsage] = useState({ sentToday: 0, remainingToday: 0 });
  const [orgName, setOrgName] = useState("");
  const { notify } = useToast();

  useEffect(() => {
    api
      .get("/email/logs")
      .then((res) => {
        setLogs(res.data.logs || []);
        setUsage(res.data.usage || { sentToday: 0, remainingToday: 0 });
        setOrgName(res.data.organization?.name || "");
      })
      .catch(() => notify("Failed to load organization logs", "error"));
  }, [notify]);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Organization Email Logs</h1>
      <p className="mt-2 text-sm text-slate-300">
        {orgName ? `${orgName} • ` : ""}Sent today: {usage.sentToday} • Remaining: {usage.remainingToday}
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
              <th className="p-3">Attempts</th>
              <th className="p-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-800">
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
