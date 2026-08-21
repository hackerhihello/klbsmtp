"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrgSidebar from "../../../components/OrgSidebar";

export default function OrganizationDashboardLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apiKey = localStorage.getItem("orgApiKey");
    if (!apiKey) {
      router.push("/org/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="md:flex">
      <OrgSidebar />
      <div className="min-h-screen flex-1 bg-slate-950">{children}</div>
    </div>
  );
}
