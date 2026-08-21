"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";

export default function OrganizationLoginPage() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { notify } = useToast();

  const submit = async (event) => {
    event.preventDefault();
    if (!apiKey.trim()) {
      notify("API key is required", "error");
      return;
    }
    setLoading(true);
    try {
      localStorage.removeItem("token");
      localStorage.setItem("orgApiKey", apiKey.trim());
      await api.get("/org/dashboard");
      notify("Organization login successful");
      router.push("/org/dashboard");
    } catch (error) {
      localStorage.removeItem("orgApiKey");
      notify(error?.response?.data?.message || "Invalid API key", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-16 max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8">
      <h1 className="text-3xl font-semibold">Organization Login</h1>
      <p className="mt-2 text-sm text-slate-300">Use your organization API key to access the email dashboard.</p>
      <form className="mt-6 space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="org_xxxxxxxxxxxxx"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
        />
        <button className="w-full rounded bg-indigo-500 px-4 py-2" disabled={loading} type="submit">
          {loading ? "Verifying..." : "Continue"}
        </button>
      </form>
    </main>
  );
}
