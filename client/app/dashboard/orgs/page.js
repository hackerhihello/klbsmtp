"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", blocked: "" });
  const { notify } = useToast();

  const loadOrgs = async () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.blocked) params.blocked = filters.blocked;

    try {
      const res = await api.get("/admin/orgs", { params });
      setOrgs(res.data);
    } catch {
      notify("Failed to load organizations", "error");
    }
  };

  useEffect(() => {
    loadOrgs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.blocked]);

  const updateControls = async (org, patch) => {
    api
      .patch(`/admin/orgs/${org.id}/controls`, patch)
      .then(() => {
        notify("Organization controls updated");
        loadOrgs();
      })
      .catch(() => notify("Failed to update organization controls", "error"));
  };

  const selectApiKey = (apiKey) => {
    localStorage.setItem("selectedOrgApiKey", apiKey);
    notify("Organization API key selected for Send Email page");
  };

  const copyApiKey = async (apiKey) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      notify("API key copied");
    } catch {
      notify("Failed to copy API key", "error");
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Organization List</h1>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          className="rounded bg-slate-800 p-2"
          placeholder="Search org/contact/email"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select
          className="rounded bg-slate-800 p-2"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
        <select
          className="rounded bg-slate-800 p-2"
          value={filters.blocked}
          onChange={(e) => setFilters((prev) => ({ ...prev, blocked: e.target.value }))}
        >
          <option value="">All block states</option>
          <option value="true">blocked</option>
          <option value="false">not blocked</option>
        </select>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Status</th>
              <th className="p-3">Usage State</th>
              <th className="p-3">Daily Limit</th>
              <th className="p-3">Sent Today</th>
              <th className="p-3">API Key</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-t border-slate-800">
                <td className="p-3">{org.name}</td>
                <td className="p-3">
                  <div>{org.contactName || "-"}</div>
                  <div className="text-xs text-slate-400">{org.contactEmail || "-"}</div>
                </td>
                <td className="p-3">{org.status}</td>
                <td className="p-3">
                  {org.isBlocked ? (
                    <span className="rounded bg-red-900 px-2 py-1 text-xs">Blocked</span>
                  ) : org.allowOverLimitOverride ? (
                    <span className="rounded bg-amber-900 px-2 py-1 text-xs">Override Enabled</span>
                  ) : (
                    <span className="rounded bg-emerald-900 px-2 py-1 text-xs">Normal</span>
                  )}
                </td>
                <td className="p-3">{org.dailyLimit}</td>
                <td className="p-3">{org.sentToday ?? 0}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block max-w-[220px] truncate align-middle">{org.apiKey}</span>
                    <button
                      type="button"
                      aria-label="Copy API key"
                      title="Copy API key"
                      className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800"
                      onClick={() => copyApiKey(org.apiKey)}
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded border border-slate-700 px-3 py-1"
                      onClick={() => selectApiKey(org.apiKey)}
                      type="button"
                    >
                      Use for testing
                    </button>
                    <button
                      className="rounded border border-red-700 px-3 py-1"
                      onClick={() => updateControls(org, { isBlocked: !org.isBlocked })}
                      type="button"
                    >
                      {org.isBlocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      className="rounded border border-amber-700 px-3 py-1"
                      onClick={() =>
                        updateControls(org, { allowOverLimitOverride: !org.allowOverLimitOverride })
                      }
                      type="button"
                    >
                      {org.allowOverLimitOverride ? "Disable Override" : "Enable Override"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td className="p-4 text-slate-300" colSpan={8}>
                  No organizations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
