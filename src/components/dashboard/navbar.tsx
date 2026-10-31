"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Squares2X2Icon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import ProjectSearchPanel from "@/components/dashboard/ProjectSearchPanel";

export default function DashboardNavbar() {
  const { user, handleLogout } = useAuth();
  const params = useParams();

  const [searchQuery, setSearchQuery] = useState("");
  const isMac = typeof window !== "undefined" && typeof navigator !== "undefined" && (navigator.platform?.toUpperCase().indexOf("MAC") ?? -1) >= 0;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const projectId = (() => {
    const id = params?.projectId;
    return Array.isArray(id) ? id[0] : id ?? null;
  })();
  const isInsideProject = Boolean(projectId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isInsideProject) setIsPanelOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isInsideProject]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      if (!isInsideProject) {
        setSearchQuery("");
        return;
      }

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

  const formatRole = (role?: string) => {
    if (!role) return "Member";
    return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Search bar */}
          <div className="flex flex-1 items-center min-w-0">
            <form onSubmit={handleSearch} className="w-full max-w-xl relative group flex items-center">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <MagnifyingGlassIcon
                  className={`h-4 w-4 transition-colors ${
                    isInsideProject
                      ? "text-gray-400 group-focus-within:text-[#2563EB]"
                      : "text-gray-300"
                  }`}
                />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className={`block w-full rounded-xl border py-2 pl-10 pr-24 text-xs transition-all focus:outline-none ${
                  isInsideProject
                    ? "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 hover:bg-gray-100/50 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                    : "border-gray-200/60 bg-gray-50/50 text-gray-400 cursor-not-allowed placeholder:text-gray-400"
                }`}
                placeholder={isInsideProject ? "Search in project notes & meetings..." : "Open any project to search..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                readOnly={!isInsideProject}
                autoComplete="off"
              />

              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {searchQuery.trim().length > 0 ? (
                  <button
                    type="submit"
                    className="flex h-6 items-center rounded-lg bg-[#2563EB] px-2.5 text-[10px] font-semibold text-white hover:bg-[#1d4ed8]"
                  >
                    Search
                  </button>
                ) : isInsideProject ? (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-gray-500 shadow-xs">
                    <span>{isMac ? "⌘" : "Ctrl"}</span>
                    <span>K</span>
                  </kbd>
                ) : null}
              </div>
            </form>
          </div>

          {/* Right accessories */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition shadow-xs"
                aria-label="Notifications"
              >
                <BellIcon className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 bg-white p-3 text-gray-900 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Notifications
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">All caught up</span>
                  </div>
                  <div className="py-6 text-center text-xs text-gray-400">
                    No new alerts or pending tasks.
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-gray-200" />

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white py-1.5 pl-2 pr-3 text-left transition hover:border-gray-300 hover:bg-gray-50 shadow-xs"
              >
                {user?.avatar ? (
                  <img
                    className="h-7 w-7 rounded-lg object-cover ring-1 ring-gray-200"
                    src={user.avatar}
                    alt=""
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#2563EB] to-cyan-500 text-xs font-bold text-white shadow-xs">
                    {user?.firstName?.[0] || "O"}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-900 leading-none">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-none mt-1">
                    {formatRole(user?.role)}
                  </span>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-gray-200 bg-white p-1.5 text-gray-900 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="text-xs font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                    >
                      <Squares2X2Icon className="h-4 w-4 text-gray-500" />
                      Dashboard
                    </Link>
                    <Link
                      href="/projects"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                    >
                      <FolderIcon className="h-4 w-4 text-gray-500" />
                      Projects
                    </Link>
                    <Link
                      href="/settings/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                    >
                      <UserCircleIcon className="h-4 w-4 text-gray-500" />
                      Profile Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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
