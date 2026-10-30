"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  CalendarDaysIcon,
  UsersIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  ChevronLeftIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { getMenuForRole } from "@/lib/auth/dashboard-config";
import { useAuth } from "@/hooks/useAuth";
import AversALogo, { AversALogoMark } from "@/components/Ui/AversALogo";

const ICON_BY_PATH: Record<string, any> = {
  "/dashboard": HomeIcon,
  "/projects": FolderIcon,
  "/meetings": CalendarDaysIcon,
  "/users": UsersIcon,
  "/organizations": BuildingOffice2Icon,
  "/settings/profile": Cog6ToothIcon,
};

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  sidebarWidth: number;
  onResizeSidebar: (width: number) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  sidebarWidth,
  onResizeSidebar,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, dashboardPath } = useAuth();
  const menuItems = getMenuForRole(user?.role);

  // Check if current page is within a specific project workspace
  const isProjectWorkspace = pathname.startsWith("/projects/") && pathname.split("/").length >= 3;
  const projectId = isProjectWorkspace ? pathname.split("/")[2] : null;

  // Track sub-menu collapse state if needed
  const [projectSubmenuOpen, setProjectSubmenuOpen] = useState(true);

  const startResize = useCallback(
    (mouseDownEvent: React.MouseEvent) => {
      const startX = mouseDownEvent.clientX;
      const startWidth = sidebarWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const nextWidth = Math.min(380, Math.max(240, startWidth + (moveEvent.clientX - startX)));
        onResizeSidebar(nextWidth);
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

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200/90 bg-white p-3.5 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:[width:var(--sidebar-width)]"}`}
        style={{
          "--sidebar-width": `${sidebarWidth}px`,
        } as React.CSSProperties}
      >
        {/* Brand Header */}
        <div className="mb-4 flex items-center justify-between px-1.5 pt-1">
          <Link
            href={dashboardPath || "/dashboard"}
            onClick={onCloseMobile}
            className={`flex items-center gap-2.5 transition hover:opacity-90 ${
              collapsed ? "justify-center w-full" : ""
            }`}
          >
            {collapsed ? (
              <AversALogoMark size={32} />
            ) : (
              <AversALogo size="sm" showTagline={true} />
            )}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Organization / Workspace Badge */}
        {!collapsed ? (
          <div className="mb-3 rounded-2xl border border-gray-200/80 bg-linear-to-b from-gray-50/90 to-white p-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs">
                {((user as any)?.organization?.name?.[0] || "A").toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-gray-900 tracking-tight">
                  {(user as any)?.organization?.name || "AversA Workspace"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-medium text-gray-500 capitalize truncate">
                    {user?.role?.replace(/_/g, " ") || "Member"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex justify-center">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs"
              title={(user as any)?.organization?.name || "AversA Workspace"}
            >
              {((user as any)?.organization?.name?.[0] || "A").toUpperCase()}
            </span>
          </div>
        )}

        {/* Collapse toggle (desktop) */}
        <div className="mb-2 hidden lg:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex w-full items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Bars3BottomLeftIcon className="h-4 w-4 shrink-0 text-gray-500" />
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>

        {/* Main Navigation Items */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pt-1 pr-0.5" aria-label="Dashboard navigation">
          {menuItems.map((item: any) => {
            const Icon = item.icon || ICON_BY_PATH[item.href] || HomeIcon;
            const isProjectsNav = item.href === "/projects";
            const isExactActive = pathname === item.href;
            const isChildActive =
              item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`);
            const isActive = isExactActive || isChildActive;

            return (
              <div key={item.href} className="space-y-1">
                {/* Primary Nav Item Link */}
                <div className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex flex-1 items-center rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-[#2563EB] shadow-2xs font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                    } ${collapsed ? "justify-center px-2" : "gap-3"}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? "text-[#2563EB]" : "text-gray-500"
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                  </Link>

                  {/* Toggle sub-menu button if on projects and not collapsed */}
                  {isProjectsNav && !collapsed && (isProjectWorkspace || isExactActive) && (
                    <button
                      type="button"
                      onClick={() => setProjectSubmenuOpen((prev) => !prev)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                      aria-label="Toggle projects submenu"
                    >
                      {projectSubmenuOpen ? (
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Nested Submenu for Projects */}
                {isProjectsNav && !collapsed && projectSubmenuOpen && (isProjectWorkspace || isExactActive) && (
                  <div className="ml-4 pl-3 border-l-2 border-gray-100 space-y-1 my-1">
                    {/* All Projects link (clean single back icon when inside workspace) */}
                    {isProjectWorkspace ? (
                      <Link
                        href="/projects"
                        onClick={onCloseMobile}
                        className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-[#2563EB] transition"
                      >
                        <ChevronLeftIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#2563EB] transition-transform group-hover:-translate-x-0.5" />
                        <span>All Projects</span>
                      </Link>
                    ) : null}

                    {/* Active Project Workspace Sub-items */}
                    {isProjectWorkspace && projectId && (
                      <div className="pt-1 space-y-0.5">
                        <div className="px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          <SparklesIcon className="h-3 w-3 text-[#2563EB]" />
                          <span>Active Workspace</span>
                        </div>

                        {/* Discovery Matrix link */}
                        <Link
                          href={`/projects/${projectId}`}
                          onClick={onCloseMobile}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition ${
                            pathname === `/projects/${projectId}`
                              ? "bg-blue-100/70 text-[#2563EB] font-bold"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                          }`}
                        >
                          <QuestionMarkCircleIcon className="h-3.5 w-3.5 shrink-0 text-current" />
                          <span className="truncate">Discovery Matrix</span>
                        </Link>

                        {/* Project Meetings link */}
                        <Link
                          href={`/projects/${projectId}/meetings`}
                          onClick={onCloseMobile}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition ${
                            pathname.startsWith(`/projects/${projectId}/meetings`)
                              ? "bg-blue-100/70 text-[#2563EB] font-bold"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                          }`}
                        >
                          <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0 text-current" />
                          <span className="truncate">Project Meetings</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Status Pill */}
        {!collapsed && (
          <div className="mt-auto pt-3">
            <div className="rounded-2xl border border-gray-200/90 bg-linear-to-b from-gray-50/80 to-white p-3 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold text-gray-800">AversA Platform</span>
              </div>
              <p className="mt-0.5 text-[10px] text-gray-500 font-medium">Intelligent Discovery & Ops</p>
            </div>
          </div>
        )}

        {/* Resizable grab handle (desktop only) */}
        {!collapsed && (
          <div
            className="absolute inset-y-0 -right-1 hidden w-2 cursor-ew-resize lg:block"
            onMouseDown={startResize}
            aria-hidden="true"
            title="Drag to resize sidebar"
          />
        )}
      </aside>
    </>
  );
}
