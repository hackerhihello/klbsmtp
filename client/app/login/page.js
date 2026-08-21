"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { useToast } from "../../components/ToastProvider";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { notify } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", form);
      localStorage.setItem("token", data.token);
      localStorage.removeItem("orgApiKey");
      localStorage.removeItem("selectedOrgApiKey");
      notify("Admin login successful");
      router.push("/dashboard");
    } catch (err) {
      const res = err?.response;
      const data = res?.data;
      let msg = "Login failed";
      if (data?.code === "DATABASE_UNAVAILABLE") {
        msg =
          "The API cannot reach the database. Fix DATABASE_URL on the server (local .env or your host’s Postgres connection string).";
      } else if (res?.status === 401) {
        msg = data?.message || "Invalid email or password";
      } else if (res?.status === 503) {
        msg = data?.message || "Service temporarily unavailable. Try again later.";
      } else {
        msg = data?.message || err?.message || "Request failed";
      }
      setError(msg);
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-16 max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8">
      <h1 className="text-3xl font-semibold">Admin Login</h1>
      <p className="mt-2 text-sm text-slate-300">Only seeded system admin can access onboarding controls.</p>
      <form className="mt-6 space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="admin@gmail.com"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="text-red-400">{error}</p>}
        <button className="w-full rounded bg-indigo-500 px-4 py-2" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
