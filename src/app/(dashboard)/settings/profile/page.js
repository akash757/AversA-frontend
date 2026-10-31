"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/providers/AuthProvider";
import { updateProfile, changePassword } from "@/features/auth/auth";
import { getOrganizationById, updateOrganization } from "@/features/organizations/organizations";
import { useToast } from "@/components/Ui/Toast";
import Skeleton from "@/components/Ui/Skeleton";
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  KeyIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { refreshUser } = useAuthContext();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "password" | "org"
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [orgData, setOrgData] = useState({ name: "", email: "", phone: "", description: "" });
  const [orgLoading, setOrgLoading] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });

      if (user.organizationId) {
        setOrgLoading(true);
        getOrganizationById(user.organizationId)
          .then((res) => {
            if (res.success && res.data?.organization) {
              const o = res.data.organization;
              setOrgData({
                name: o.name || "",
                email: o.email || "",
                phone: o.phone || "",
                description: o.description || "",
              });
            }
          })
          .catch(() => {})
          .finally(() => setOrgLoading(false));
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      if (res.success) {
        toast.success("Profile updated successfully!");
        if (refreshUser) refreshUser();
      } else {
        toast.error(res.message || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred while updating profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      if (res.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res.message || "Failed to change password.");
      }
    } catch {
      toast.error("Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    if (!user?.organizationId) return;
    setIsSavingOrg(true);
    try {
      const res = await updateOrganization(user.organizationId, orgData);
      if (res.success) {
        toast.success("Organization details updated!");
      } else {
        toast.error(res.message || "Failed to update organization.");
      }
    } catch {
      toast.error("Failed to update organization.");
    } finally {
      setIsSavingOrg(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <div className="space-y-1">
          <Skeleton variant="line" width="16rem" height="1.75rem" />
          <Skeleton variant="line" width="22rem" height="0.875rem" />
        </div>
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          <Skeleton variant="block" width="6rem" height="2rem" rounded="md" />
          <Skeleton variant="block" width="6rem" height="2rem" rounded="md" />
          <Skeleton variant="block" width="6rem" height="2rem" rounded="md" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <Skeleton variant="avatar" width="4rem" height="4rem" />
          <Skeleton variant="block" height="2.5rem" rounded="xl" />
          <Skeleton variant="block" height="2.5rem" rounded="xl" />
          <Skeleton variant="block" width="8rem" height="2.5rem" rounded="xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
          Account & Profile Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your personal details, credentials, and organization workspace.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "profile"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <UserCircleIcon className="h-4 w-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "password"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <KeyIcon className="h-4 w-4" />
          <span>Security & Password</span>
        </button>

        {user?.organizationId && (
          <button
            type="button"
            onClick={() => setActiveTab("org")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === "org"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <BuildingOfficeIcon className="h-4 w-4" />
            <span>Organization</span>
          </button>
        )}
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs max-w-2xl">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-[#2563EB] border border-blue-100">
              {user?.firstName?.[0] || "O"}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB] border border-blue-200 capitalize">
                Role: {user?.role?.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition shadow-xs"
              >
                <CheckIcon className="h-4 w-4" />
                <span>{isSavingProfile ? "Saving…" : "Save Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Form */}
      {activeTab === "password" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs max-w-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-gray-500">At least 8 characters long</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition shadow-xs"
              >
                <KeyIcon className="h-4 w-4" />
                <span>{isChangingPassword ? "Updating…" : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === "org" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
            Organization Workspace
          </h2>

          <form onSubmit={handleOrgSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={orgData.name}
                onChange={(e) => setOrgData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={orgData.email}
                  onChange={(e) => setOrgData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={orgData.phone}
                  onChange={(e) => setOrgData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={orgData.description}
                onChange={(e) => setOrgData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingOrg}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition shadow-xs"
              >
                <BuildingOfficeIcon className="h-4 w-4" />
                <span>{isSavingOrg ? "Saving…" : "Save Organization"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
