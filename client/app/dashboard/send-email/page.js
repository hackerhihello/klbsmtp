"use client";

import { useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";

export default function SendEmailPage() {
  const [form, setForm] = useState({ recipients: "", subject: "", html: "", attachment: null });
  const [message, setMessage] = useState("");
  const { notify } = useToast();

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

  const submit = async (e) => {
    e.preventDefault();
    const selectedKey = localStorage.getItem("selectedOrgApiKey");
    if (!selectedKey) {
      notify("Select an organization API key first from Organization List", "error");
      return;
    }

    const recipients = form.recipients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      notify("Add at least one recipient", "error");
      return;
    }

    const attachmentList = [];
    if (form.attachment) {
      attachmentList.push({
        filename: form.attachment.name,
        content: await readFileAsBase64(form.attachment),
        encoding: "base64",
        contentType: form.attachment.type || "application/pdf"
      });
    }

    const payload =
      recipients.length === 1
        ? { to: recipients[0], subject: form.subject, html: form.html, attachments: attachmentList }
        : {
            emails: recipients.map((to) => ({
              to,
              subject: form.subject,
              html: form.html,
              attachments: attachmentList
            }))
          };

    try {
      const { data } = await api.post("/email/send", payload);
      setMessage(`${data.message}. Queued: ${data.queued}`);
      notify("Emails queued successfully");
    } catch (error) {
      notify(error?.response?.data?.message || "Failed to queue emails", "error");
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Send Email (API Key Test)</h1>
      <form className="mt-6 space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="Recipients (comma-separated)"
          onChange={(e) => setForm({ ...form, recipients: e.target.value })}
        />
        <input className="w-full rounded bg-slate-800 p-2" placeholder="Subject" onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        <textarea className="h-40 w-full rounded bg-slate-800 p-2" placeholder="HTML body" onChange={(e) => setForm({ ...form, html: e.target.value })} required />
        <input
          className="w-full rounded bg-slate-800 p-2"
          type="file"
          accept="application/pdf"
          onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })}
        />
        <button className="rounded bg-indigo-500 px-4 py-2" type="submit">Queue Email</button>
      </form>
      {message && <p className="mt-4 text-green-400">{message}</p>}
    </main>
  );
}
