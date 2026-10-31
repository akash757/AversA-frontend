"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AversALogo from "@/components/Ui/AversALogo";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  FolderIcon,
  CalendarIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Avatar from "@/components/Ui/Avatar";
import Button from "@/components/Ui/Button";

const publicNavLinks = [
  { label: "Product", href: "/#product" },
  { label: "How we work", href: "/#how-we-work" },
  { label: "Agents", href: "/#agents" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, isLoggedIn, handleLogout, dashboardPath } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isHome = pathname === "/";
  const darkMode = isHome && !scrolled && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatRole = (role) => {
    if (!role) return "Member";
    return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? "glass border-b border-gray-200/80 shadow-sm"
          : darkMode
            ? "bg-transparent border-b border-transparent"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center transition hover:opacity-90">
          <AversALogo size="sm" showTagline={false} inverted={darkMode} />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {!isLoggedIn ? (
            publicNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  darkMode
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))
          ) : (
            <>
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  darkMode
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                }`}
              >
                <Squares2X2Icon className="h-4 w-4 text-blue-500" />
                Dashboard
              </Link>
              <Link
                href="/projects"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  darkMode
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                }`}
              >
                <FolderIcon className="h-4 w-4 text-blue-500" />
                Projects
              </Link>
              <Link
                href="/meetings"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  darkMode
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                }`}
              >
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                Meetings
              </Link>
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200/40" />
          ) : isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-2 pr-3 text-left transition ${
                  darkMode
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                }`}
              >
                <Avatar
                  src={user?.avatar}
                  name={`${user?.firstName || ""} ${user?.lastName || ""}`}
                  size="sm"
                />
                <span
                  className={`max-w-[120px] truncate text-xs font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {user?.firstName || "Account"}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-gray-200 bg-white p-2 text-gray-900 shadow-xl ring-1 ring-black/5">
                  <div className="border-b border-gray-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-gray-950">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    <span className="mt-1.5 inline-block rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      {formatRole(user?.role)}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                    >
                      <Squares2X2Icon className="h-4 w-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/settings/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                    >
                      <UserCircleIcon className="h-4 w-4 text-gray-400" />
                      Settings & Profile
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  darkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-950"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.98]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border md:hidden ${
            darkMode
              ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-b border-gray-200 bg-white px-5 py-6 md:hidden">
          <div className="flex flex-col gap-1">
            {!isLoggedIn ? (
              publicNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Squares2X2Icon className="h-4 w-4 text-blue-600" />
                  Dashboard
                </Link>
                <Link
                  href="/projects"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FolderIcon className="h-4 w-4 text-blue-600" />
                  Projects
                </Link>
                <Link
                  href="/meetings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  Meetings
                </Link>
                <Link
                  href="/settings/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <UserCircleIcon className="h-4 w-4 text-gray-400" />
                  Profile Settings
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            {!isLoggedIn ? (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Get Started Free
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
