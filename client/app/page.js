import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-center text-4xl font-bold">Email Automation SaaS</h1>
        <p className="mt-3 text-center text-slate-300">Choose your role to continue</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <RoleCard href="/login" title="Admin Login" description="Manage organizations, monitor logs, and control onboarding." />
          <RoleCard href="/org/login" title="Organization Login" description="Access email sending and organization logs with API key." />
        </div>
      </div>
    </main>
  );
}

function RoleCard({ href, title, description }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <h2 className="text-2xl font-semibold group-hover:text-indigo-300">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </Link>
  );
}
