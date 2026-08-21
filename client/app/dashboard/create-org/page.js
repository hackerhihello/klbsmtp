"use client";

import { useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";

export default function CreateOrganizationPage() {
  const [form, setForm] = useState({
    name: "",
    contactName: "",
    contactEmail: "",
    dailyLimit: 100,
    status: "active"
  });
  const [created, setCreated] = useState(null);
  const { notify } = useToast();

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      notify("Organization name is required", "error");
      return;
    }
    if (!form.contactName.trim() || !form.contactEmail.trim()) {
      notify("Contact name and email are required", "error");
      return;
    }

    try {
      const { data } = await api.post("/admin/create-org", {
        name: form.name.trim(),
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim().toLowerCase(),
        dailyLimit: Number(form.dailyLimit) || 100,
        status: form.status
      });
      setCreated(data);
      notify("Organization created successfully");
      setForm({ name: "", contactName: "", contactEmail: "", dailyLimit: 100, status: "active" });
    } catch (error) {
      notify(error?.response?.data?.message || "Failed to create organization", "error");
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Create Organization</h1>
      <form className="mt-6 space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4" onSubmit={submit}>
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="Organization name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="Contact person name"
          value={form.contactName}
          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          required
        />
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="contact@company.com"
          type="email"
          value={form.contactEmail}
          onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
          required
        />
        <input
          className="w-full rounded bg-slate-800 p-2"
          type="number"
          min={1}
          value={form.dailyLimit}
          onChange={(e) => setForm({ ...form, dailyLimit: e.target.value })}
        />
        <select
          className="w-full rounded bg-slate-800 p-2"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
        <button className="rounded bg-indigo-500 px-4 py-2" type="submit">
          Create and Generate API Key
        </button>
      </form>

      {created && (
        <div className="mt-5 rounded-lg border border-emerald-700 bg-emerald-950 p-4 text-sm">
          <p>Organization created: {created.name}</p>
          <p className="mt-1">Contact: {created.contactName} ({created.contactEmail})</p>
          <p className="mt-1 break-all">API key: {created.apiKey}</p>
        </div>
      )}
    </main>
  );
}
