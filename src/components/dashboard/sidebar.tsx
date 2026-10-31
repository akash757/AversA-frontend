"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  CalendarDaysIcon,
  UsersIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  ChevronLeftIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";
import { getMenuForRole } from "@/lib/auth/dashboard-config";
import { useAuth } from "@/hooks/useAuth";
import AversALogo, { AversALogoMark } from "@/components/Ui/AversALogo";
import Avatar from "@/components/Ui/Avatar";
import Badge from "@/components/Ui/Badge";

const ICON_BY_PATH = {
  "/dashboard":        HomeIcon,
  "/projects":         FolderIcon,
  "/meetings":         CalendarDaysIcon,
  "/users":            UsersIcon,
  "/organizations":    BuildingOffice2Icon,
  "/settings/profile": Cog6ToothIcon,
};

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  sidebarWidth,
  onResizeSidebar,
  mobileOpen,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const { user, dashboardPath } = useAuth();
  const menuItems = getMenuForRole(user?.role);

  const isProjectWorkspace =
    pathname.startsWith("/projects/") && pathname.split("/").length >= 3;
  const projectId = isProjectWorkspace ? pathname.split("/")[2] : null;
  const [projectSubmenuOpen, setProjectSubmenuOpen] = useState(true);

  // Drag-to-resize handle
  const startResize = useCallback(
    (mouseDownEvent) => {
      const startX = mouseDownEvent.clientX;
      const startWidth = sidebarWidth;

      const onMouseMove = (e) => {
        const next = Math.min(320, Math.max(220, startWidth + (e.clientX - startX)));
        onResizeSidebar(next);
      };
      const onMouseUp = () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [onResizeSidebar, sidebarWidth]
  );

  const orgInitial = (user?.organization?.name?.[0] || "A").toUpperCase();
  const orgName    = user?.organization?.name || "AversA Workspace";
  const userRole   = user?.role?.replace(/_/g, " ") || "Member";

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
      />

      {/* Sidebar panel */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "bg-white border-r border-[#F1F5F9]",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0",
          mobileOpen ? "translate-x-0 w-[280px] shadow-2xl" : "-translate-x-full",
          collapsed ? "lg:w-[72px]" : "lg:[width:var(--sidebar-width)]",
        ].join(" ")}
        style={{ "--sidebar-width": `${sidebarWidth}px` }}
      >
        {/* ── Logo / Brand ──────────────────────────── */}
        <div
          className={[
            "flex h-16 shrink-0 items-center border-b border-[#F1F5F9]",
            collapsed ? "justify-center px-3" : "px-4 gap-3 justify-between",
          ].join(" ")}
        >
          <Link
            href={dashboardPath || "/dashboard"}
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-80"
          >
            {collapsed ? (
              <AversALogoMark size={28} />
            ) : (
              <AversALogo size="sm" showTagline={false} />
            )}
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Desktop collapse toggle */}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors"
              aria-label="Collapse sidebar"
            >
              <ArrowsPointingInIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Organization Badge ────────────────────── */}
        <div className={["px-3 py-3 border-b border-[#F1F5F9]", collapsed && "flex justify-center"].join(" ")}>
          {collapsed ? (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-xs font-bold text-white shadow-sm"
              title={orgName}
            >
              {orgInitial}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-[12px] border border-[#F1F5F9] bg-[#F8FAFC] p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-xs font-bold text-white">
                {orgInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-[#0F172A]">{orgName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                  <p className="text-[11px] font-medium text-[#94A3B8] capitalize truncate">
                    {userRole}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ───────────────────────────── */}
        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pr-2"
          aria-label="Main navigation"
        >
          {/* Expand button when collapsed (desktop) */}
          {collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex mb-1 h-9 w-9 mx-auto items-center justify-center rounded-[10px] text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors"
              aria-label="Expand sidebar"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </button>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon || ICON_BY_PATH[item.href] || HomeIcon;
            const isProjectsNav   = item.href === "/projects";
            const isExactActive   = pathname === item.href;
            const isChildActive   = item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`);
            const isActive        = isExactActive || isChildActive;

            return (
              <div key={item.href}>
                {/* Primary nav item */}
                <div className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "flex flex-1 items-center rounded-[11px] py-2.5 text-[13px] font-semibold transition-all duration-150",
                      collapsed ? "justify-center px-2" : "gap-3 px-3",
                      isActive
                        ? "bg-[#EFF6FF] text-[#2563EB]"
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        isActive ? "text-[#2563EB]" : "text-[#94A3B8]",
                      ].join(" ")}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}

                    {/* Active accent dot (collapsed) */}
                    {collapsed && isActive && (
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                    )}
                  </Link>

                  {/* Projects sub-menu toggle */}
                  {isProjectsNav && !collapsed && (isProjectWorkspace || isExactActive) && (
                    <button
                      type="button"
                      onClick={() => setProjectSubmenuOpen((v) => !v)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors"
                      aria-label="Toggle project sub-menu"
                    >
                      {projectSubmenuOpen ? (
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Projects sub-menu */}
                {isProjectsNav && !collapsed && projectSubmenuOpen && (isProjectWorkspace || isExactActive) && (
                  <div className="ml-3 mt-0.5 pl-3 border-l-2 border-[#F1F5F9] space-y-0.5">
                    {isProjectWorkspace && (
                      <Link
                        href="/projects"
                        onClick={onCloseMobile}
                        className="group flex items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-[12px] font-semibold text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-all"
                      >
                        <ChevronLeftIcon className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                        All Projects
                      </Link>
                    )}

                    {isProjectWorkspace && projectId && (
                      <div className="pt-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#C7D2FE]">
                          <SparklesIcon className="h-3 w-3 text-[#2563EB]" />
                          Active Workspace
                        </div>

                        <Link
                          href={`/projects/${projectId}`}
                          onClick={onCloseMobile}
                          className={[
                            "flex items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-[12px] transition-all",
                            pathname === `/projects/${projectId}`
                              ? "bg-[#EFF6FF] text-[#2563EB] font-bold"
                              : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] font-medium",
                          ].join(" ")}
                        >
                          <QuestionMarkCircleIcon className="h-3.5 w-3.5 shrink-0 text-current" />
                          Discovery Matrix
                        </Link>

                        <Link
                          href={`/projects/${projectId}/meetings`}
                          onClick={onCloseMobile}
                          className={[
                            "flex items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-[12px] transition-all",
                            pathname.startsWith(`/projects/${projectId}/meetings`)
                              ? "bg-[#EFF6FF] text-[#2563EB] font-bold"
                              : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] font-medium",
                          ].join(" ")}
                        >
                          <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0 text-current" />
                          Meetings
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── User footer ──────────────────────────── */}
        {!collapsed && (
          <div className="shrink-0 border-t border-[#F1F5F9] p-3">
            <div className="flex items-center gap-2.5 rounded-[12px] p-2.5 bg-[#F8FAFC] border border-[#F1F5F9]">
              <Avatar
                name={`${user?.firstName || ""} ${user?.lastName || ""}`}
                src={user?.avatar}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-[#0F172A]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-[11px] text-[#94A3B8]">{user?.email}</p>
              </div>
              <div className="flex h-2 w-2 shrink-0 items-center justify-center">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#059669]" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Resize handle (desktop only) */}
        {!collapsed && (
          <div
            className="absolute inset-y-0 -right-1 hidden w-2 cursor-ew-resize lg:block group"
            onMouseDown={startResize}
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 left-0.5 w-0.5 bg-transparent group-hover:bg-[#2563EB]/30 transition-colors" />
          </div>
        )}
      </aside>
    </>
  );
}
