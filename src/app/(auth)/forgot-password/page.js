"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Ui/Toast";
import { forgotPassword } from "@/features/auth/auth";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import { ArrowLeftIcon, EnvelopeOpenIcon } from "@heroicons/react/24/outline";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSent(true);
        toast.success("Reset link sent! Check your inbox.");
      } else {
        toast.error(res.message || "Failed to send reset link.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Account recovery"
      subtitle="We’ll email you a secure link to reset your AversA password."
    >
      <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-200/50 sm:p-8">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <EnvelopeOpenIcon className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-xl font-black tracking-tight text-gray-950">
              Check your inbox
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-gray-900">{email}</span>.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/login"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Return to sign in
              </Link>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Try a different email
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back to sign in
            </Link>

            <h1 className="text-2xl font-black tracking-tight text-gray-950">
              Reset password
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Enter your work email and we&apos;ll send a recovery link.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <AuthField
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Sending link…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}
