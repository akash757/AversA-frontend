"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AversALogo from "@/components/Ui/AversALogo";
import { useAuth } from "@/hooks/useAuth";
import { ClockIcon } from "@heroicons/react/24/outline";

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, loading, isLoggedIn, handleLogout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.replace("/login");
      } else if (user?.status === "active") {
        router.replace("/dashboard");
      }
    }
  }, [loading, isLoggedIn, user, router]);

  if (loading || !isLoggedIn || user?.status === "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 text-gray-900 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <Link href="/" className="inline-block transition transform hover:scale-105 mb-6">
          <AversALogo size="md" showTagline={false} />
        </Link>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 mb-4">
          <ClockIcon className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-gray-950">
          Account Pending Approval
        </h2>
        <p className="mt-3 text-xs leading-relaxed text-gray-600">
          Hello <span className="text-gray-950 font-semibold">{user?.firstName || "there"}</span>, your AversA workspace account was created successfully.
          An organization administrator must approve your access before you can enter the dashboard.
        </p>

        <div className="mt-5 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-[11px] font-semibold text-amber-700">
          Status: Pending Administrator Review
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-[11px] text-gray-500">
            You will receive access once approved by your workspace administrator.
          </p>
          <button
            type="button"
            onClick={() => handleLogout()}
            className="mt-4 w-full rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
