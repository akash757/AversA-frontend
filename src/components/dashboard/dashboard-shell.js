"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";
import Loader from "@/components/Ui/Loader";

export default function DashboardShell({ children }) {
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("dashboardSidebarCollapsed") === "true";
  });

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return 260;
    const stored = Number(window.localStorage.getItem("dashboardSidebarWidth"));
    return Number.isNaN(stored) || stored < 220 || stored > 320 ? 260 : stored;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !isLoggedIn) { router.replace("/login"); return; }
    if (!loading && user?.status === "pending") router.replace("/pending-approval");
  }, [isLoggedIn, loading, user, router]);

  // Persist sidebar state
  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("dashboardSidebarCollapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("dashboardSidebarWidth", String(sidebarWidth));
  }, [sidebarWidth]);

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
      {/* Left sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        sidebarWidth={sidebarWidth}
        onResizeSidebar={setSidebarWidth}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 pb-12 pt-6 sm:px-5 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
