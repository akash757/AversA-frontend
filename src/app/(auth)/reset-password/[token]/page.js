"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Ui/Toast";
import { resetPassword } from "@/features/auth/auth";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const params = useParams();
  const toast = useToast();
  const token = params?.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(res.message || "Failed to reset password. Link may be expired.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Secure your workspace"
      subtitle="Choose a strong password to protect your AversA account."
    >
      <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-200/50 sm:p-8">
        {success ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-xl font-black tracking-tight text-gray-950">
              Password updated
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your credentials have been updated successfully.
            </p>
            <Link
              href="/login"
              className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Sign in now
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black tracking-tight text-gray-950">
              Set new password
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <PasswordInput
                label="New password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                showStrength
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm new password"
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
                {loading ? "Updating password…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}
