"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  FolderIcon,
  UserCircleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/Ui/Avatar";
import Badge from "@/components/Ui/Badge";
import ProjectSearchPanel from "@/components/dashboard/ProjectSearchPanel";

export default function DashboardNavbar({ onOpenMobile }) {
  const { user, handleLogout } = useAuth();
  const params = useParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const dropdownRef   = useRef(null);
  const notifRef      = useRef(null);

  const projectId = (() => {
    const id = params?.projectId;
    return Array.isArray(id) ? id[0] : id ?? null;
  })();
  const isInsideProject = Boolean(projectId);

  const isMac =
    typeof window !== "undefined" &&
    navigator?.platform?.toUpperCase().includes("MAC");

  // Click-outside close
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setIsNotificationOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ⌘K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isInsideProject) setIsPanelOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isInsideProject]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (!trimmed || !isInsideProject) return;
      setSubmittedKeyword(trimmed);
      setIsPanelOpen(true);
    },
    [searchQuery, isInsideProject]
  );

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSearchQuery("");
    setSubmittedKeyword("");
  }, []);

  const formatRole = (role) =>
    role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Member";

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-[#F1F5F9] bg-white/95 px-4 backdrop-blur-md sm:px-5 lg:px-6">

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors lg:hidden"
          aria-label="Open navigation"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-1 items-center min-w-0">
          <div className="relative w-full max-w-lg group">
            <MagnifyingGlassIcon
              className={[
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none",
                isInsideProject
                  ? "text-[#94A3B8] group-focus-within:text-[#2563EB]"
                  : "text-[#CBD5E1]",
              ].join(" ")}
            />
            <input
              type="text"
              name="search"
              id="dash-search"
              className={[
                "block w-full rounded-[11px] border py-2 pl-9 pr-20 text-[13px] transition-all focus:outline-none",
                isInsideProject
                  ? "border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] placeholder:text-[#CBD5E1] hover:bg-white focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_#EFF6FF]"
                  : "border-[#F1F5F9] bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed",
              ].join(" ")}
              placeholder={
                isInsideProject
                  ? "Search notes & meetings…"
                  : "Open a project to search…"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              readOnly={!isInsideProject}
              autoComplete="off"
            />

            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {searchQuery.trim().length > 0 ? (
                <button
                  type="submit"
                  className="flex h-6 items-center rounded-[7px] bg-[#2563EB] px-2.5 text-[11px] font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
                >
                  Search
                </button>
              ) : isInsideProject ? (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-[6px] border border-[#E2E8F0] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#94A3B8] shadow-sm">
                  <span>{isMac ? "⌘" : "Ctrl"}</span>
                  <span>K</span>
                </kbd>
              ) : null}
            </div>
          </div>
        </form>

        {/* Right accessories */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-white text-[#94A3B8] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#475569] transition-all shadow-sm"
              aria-label="Notifications"
            >
              <BellIcon className="h-[18px] w-[18px]" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-[16px] border border-[#E2E8F0] bg-white p-3 shadow-xl ring-1 ring-[#0F172A]/5 animate-scale-in">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    Notifications
                  </span>
                  <Badge variant="success" dot>All caught up</Badge>
                </div>
                <div className="py-8 text-center text-xs text-[#94A3B8]">
                  No new alerts or tasks.
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-[#F1F5F9]" />

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex items-center gap-2 rounded-[11px] border border-[#E2E8F0] bg-white py-1.5 pl-1.5 pr-3 transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC] shadow-sm"
            >
              <Avatar
                src={user?.avatar}
                name={`${user?.firstName || ""} ${user?.lastName || ""}`}
                size="sm"
              />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[13px] font-bold text-[#0F172A] leading-none">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="mt-0.5 text-[11px] text-[#94A3B8] leading-none capitalize">
                  {formatRole(user?.role)}
                </span>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-[16px] border border-[#E2E8F0] bg-white p-1.5 shadow-xl ring-1 ring-[#0F172A]/5 animate-scale-in">
                <div className="border-b border-[#F1F5F9] px-3 py-2.5">
                  <p className="text-[13px] font-bold text-[#0F172A]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] truncate">{user?.email}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  {[
                    { href: "/dashboard",      icon: Squares2X2Icon, label: "Dashboard" },
                    { href: "/projects",       icon: FolderIcon,     label: "Projects" },
                    { href: "/settings/profile", icon: UserCircleIcon, label: "Profile Settings" },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                    >
                      <Icon className="h-4 w-4 text-[#94A3B8]" />
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-[#F1F5F9] pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                    className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold text-[#DC2626] hover:bg-[#FFF1F2] transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Project search panel */}
      {isInsideProject && (
        <ProjectSearchPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          projectId={projectId}
          initialKeyword={submittedKeyword}
        />
      )}
    </>
  );
}
