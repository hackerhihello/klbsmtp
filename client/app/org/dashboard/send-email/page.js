"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import { useToast } from "../../../../components/ToastProvider";

export default function OrganizationSendEmailPage() {
  const [form, setForm] = useState({ recipients: "", subject: "", html: "", attachment: null });
  const [usage, setUsage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const { notify } = useToast();

  const recipientCount = form.recipients
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;

  const dailyLimit = usage?.dailyLimit || (usage ? usage.sentToday + usage.remainingToday : 100);
  const usedToday = usage?.sentToday || 0;
  const progress = Math.min((usedToday / Math.max(dailyLimit, 1)) * 100, 100);
  const blockedForThisRequest = Boolean(usage && usage.remainingToday <= 0 && recipientCount !== 1);

  useEffect(() => {
    api
      .get("/email/logs")
      .then((res) => setUsage(res.data.usage))
      .catch(() => notify("Failed to load usage info", "error"));
  }, [notify]);

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result || "");
        const base64 = value.includes(",") ? value.split(",")[1] : value;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const submit = async (event) => {
    event.preventDefault();
    const recipients = form.recipients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      notify("Add at least one recipient email", "error");
      return;
    }

    const attachments = [];
    if (form.attachment) {
      attachments.push({
        filename: form.attachment.name,
        content: await readFileAsBase64(form.attachment),
        encoding: "base64",
        contentType: form.attachment.type || "application/pdf"
      });
    }

    const payload =
      recipients.length === 1
        ? { to: recipients[0], subject: form.subject, html: form.html, attachments }
        : { emails: recipients.map((to) => ({ to, subject: form.subject, html: form.html, attachments })) };

    try {
      setIsSending(true);
      const { data } = await api.post("/email/send", payload);
      if (data.warning) {
        notify(data.warning, "warning");
      } else {
        notify(`Queued ${data.queued} email(s) successfully`);
      }
      const logsResponse = await api.get("/email/logs");
      setUsage(logsResponse.data.usage);
    } catch (error) {
      notify(error?.response?.data?.error || error?.response?.data?.message || "Failed to queue emails", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Send Email</h1>
      <p className="mt-2 text-sm text-slate-300">Emails used today: {usage ? `${usedToday} / ${dailyLimit}` : "loading..."}</p>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      {blockedForThisRequest && (
        <p className="mt-2 text-sm text-red-400">Daily limit reached (100 emails). Sending blocked.</p>
      )}
      <form className="mt-6 space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4" onSubmit={submit}>
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="Recipients (comma-separated)"
          onChange={(e) => setForm({ ...form, recipients: e.target.value })}
          required
        />
        <input className="w-full rounded bg-slate-800 p-2" placeholder="Subject" onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        <textarea className="h-40 w-full rounded bg-slate-800 p-2" placeholder="HTML body" onChange={(e) => setForm({ ...form, html: e.target.value })} required />
        <input
          className="w-full rounded bg-slate-800 p-2"
          type="file"
          accept="application/pdf"
          onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })}
        />
        <button
          className={`rounded px-4 py-2 ${blockedForThisRequest ? "bg-slate-700 text-slate-300" : "bg-indigo-500"}`}
          type="submit"
          disabled={blockedForThisRequest || isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </main>
  );
}
