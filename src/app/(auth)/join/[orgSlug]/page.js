"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Ui/Toast";
import { resetPassword } from "@/features/auth/auth";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

function JoinForm() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid invitation link. No token found.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setSuccess(true);
      } else {
        toast.error(res.message || "Failed to set password. The link may be expired.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={success ? "Welcome to the team" : "Accept your invitation"}
      subtitle={
        success
          ? "Your account is activated. Sign in and start collaborating on AversA projects."
          : "Set a secure password to activate your workspace membership."
      }
    >
      <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-200/50 sm:p-8">
        {success ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-xl font-black tracking-tight text-gray-950">
              Account activated
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your password has been saved. You can now access the dashboard.
            </p>
            <Link
              href="/login"
              className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black tracking-tight text-gray-950">
              Activate account
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Choose a secure password to get started.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <PasswordInput
                label="Password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                showStrength
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Activating…" : "Activate account"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
          Loading…
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
