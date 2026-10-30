"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FolderIcon, CalendarDaysIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

function getPageTitle(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] || "dashboard";

  if (first === "projects" && segments[1]) {
    return `Project Workspace`;
  }

  return first
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DashboardHeader() {
  const pathname = usePathname();
  const { user, handleLogout } = useAuth();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{pageTitle}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            AversA Platform • Connected as <span className="text-[#2563EB] font-medium">{(user?.role || "user").replaceAll("_", " ")}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950 shadow-xs"
          >
            <FolderIcon className="h-4 w-4 text-[#2563EB]" />
            Projects
          </Link>
          <Link
            href="/meetings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950 shadow-xs"
          >
            <CalendarDaysIcon className="h-4 w-4 text-emerald-600" />
            Meetings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
