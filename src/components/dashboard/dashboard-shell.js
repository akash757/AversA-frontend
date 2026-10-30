"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
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
    if (Number.isNaN(stored) || stored < 220 || stored > 360) {
      return 260;
    }
    return stored;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (!loading && user?.status === "pending") {
      router.replace("/pending-approval");
    }
  }, [isLoggedIn, loading, user, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dashboardSidebarCollapsed", String(collapsed));
    }
  }, [collapsed]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dashboardSidebarWidth", String(sidebarWidth));
    }
  }, [sidebarWidth]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50/60 text-gray-900 antialiased">
      {/* Mobile Sidebar Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-xl transition hover:border-blue-500 hover:text-blue-600 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((current) => !current)}
          sidebarWidth={sidebarWidth}
          onResizeSidebar={setSidebarWidth}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
