"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Ui/Toast";
import { signUp, googleSignIn } from "@/features/auth/auth";
import { useAuth } from "@/hooks/useAuth";
import RoleSelectModal from "@/components/Ui/RoleSelectModal";
import { getDashboardHomeRoute } from "@/lib/auth/dashboard-config";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import PasswordInput from "@/components/auth/PasswordInput";
import GoogleButton from "@/components/auth/GoogleButton";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

const USER_ROLES = [
  { value: "product_manager", label: "Product Manager", blurb: "Own discovery & proposals" },
  { value: "project_manager", label: "Project Manager", blurb: "Plan & assign delivery" },
  { value: "developer", label: "Developer", blurb: "Build from REQ-linked tasks" },
  { value: "designer", label: "Designer", blurb: "Shape product experience" },
  { value: "client", label: "Client", blurb: "Align on scope & progress" },
  { value: "qa", label: "QA", blurb: "Validate against criteria" },
  { value: "sales", label: "Sales", blurb: "Qualify & hand off leads" },
  { value: "devops", label: "DevOps", blurb: "Ship & monitor releases" },
];

function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const { login, isLoggedIn, loading: authLoading, dashboardPath } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && isLoggedIn && dashboardPath) {
      router.replace(dashboardPath);
    }
  }, [isLoggedIn, authLoading, dashboardPath, router]);

  const initialEmail = searchParams.get("email") || "";
  const orgSlug = searchParams.get("orgSlug") || "";

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("product_manager");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingGoogleCode, setPendingGoogleCode] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [errors, setErrors] = useState({});

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const GOOGLE_SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar.events",
  ].join(" ");

  const dashboardHome = getDashboardHomeRoute();

  useEffect(() => {
    if (document.getElementById("google-gis-script") && window.google?.accounts?.oauth2) {
      setGisLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGisLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleGoogleSignup = useCallback(() => {
    if (!window.google?.accounts?.oauth2) {
      toast.error("Google Sign-In is loading. Please try again.");
      return;
    }

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      ux_mode: "popup",
      callback: (response) => {
        if (response.error) {
          toast.error("Google sign-in was cancelled.");
          return;
        }
        setPendingGoogleCode(response.code);
        setShowRoleModal(true);
      },
    });

    client.requestCode({ prompt: "consent" });
  }, [GOOGLE_CLIENT_ID, GOOGLE_SCOPES, toast]);

  const handleRoleSelected = useCallback(
    async (selectedRole) => {
      if (!pendingGoogleCode) return;
      setGoogleLoading(true);
      try {
        const res = await googleSignIn(pendingGoogleCode, selectedRole, orgSlug);
        if (res.success) {
          toast.success("Welcome to AversA!");
          login(res.data.user);
          router.push(dashboardHome);
        } else {
          toast.error(res.message || "Google authentication failed.");
        }
      } catch {
        toast.error("Something went wrong with Google sign-in.");
      } finally {
        setGoogleLoading(false);
        setShowRoleModal(false);
        setPendingGoogleCode(null);
      }
    },
    [dashboardHome, login, orgSlug, pendingGoogleCode, router, toast]
  );

  const handleRoleCancel = useCallback(() => {
    setShowRoleModal(false);
    setPendingGoogleCode(null);
  }, []);

  const validateStep1 = () => {
    const next = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    if (!email.trim()) next.email = "Email is required.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signUp({
        firstName,
        lastName,
        email,
        password,
        role,
        ...(phone && { phone }),
        ...(orgSlug && { organizationSlug: orgSlug }),
      });

      if (res.success) {
        toast.success("Account created! Please log in.");
        router.push("/login");
      } else {
        toast.error(res.message || "Failed to create account.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthShell
        title="Join AversA"
        subtitle="Create a workspace and start turning client conversations into shipped work."
      >
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-200/50 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-950">
                Create account
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2].map((n) => (
                <div key={n} className="flex items-center gap-1.5">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === n
                      ? "bg-blue-600 text-white"
                      : step > n
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {step > n ? <CheckIcon className="h-3.5 w-3.5" /> : n}
                  </span>
                  {n === 1 && <span className="h-px w-4 bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>

          {orgSlug && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <BuildingOffice2Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>
                Joining organization:{" "}
                <strong className="font-semibold text-gray-950">{orgSlug}</strong>
              </span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleContinue} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <AuthField
                  label="First name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                <AuthField
                  label="Last name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Morgan"
                  error={errors.lastName}
                  autoComplete="family-name"
                />
              </div>

              <AuthField
                label="Work email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                error={errors.email}
                autoComplete="email"
              />

              <PasswordInput
                id="signup-password"
                label="Password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                showStrength
                error={errors.password}
                autoComplete="new-password"
              />

              <PasswordInput
                id="signup-confirm-password"
                label="Confirm password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-[0.99]"
              >
                Continue
                <ArrowRightIcon className="h-4 w-4" />
              </button>

              <div className="my-1 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  or
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <GoogleButton
                onClick={handleGoogleSignup}
                loading={googleLoading}
                disabled={!gisLoaded}
                label="Continue with Google"
              />
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">
                  How will you use AversA?
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {USER_ROLES.map((r) => {
                    const selected = role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`rounded-2xl border px-3.5 py-3 text-left transition ${selected
                          ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
                          : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-gray-950">{r.label}</span>
                          {selected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">{r.blurb}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <AuthField
                label="Phone (optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0100"
                autoComplete="tel"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 flex-[1.4] items-center justify-center rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating…
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </AuthShell>

      <RoleSelectModal
        open={showRoleModal}
        onSelect={handleRoleSelected}
        onCancel={handleRoleCancel}
        loading={googleLoading}
      />
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
          Loading…
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
