"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "@/features/organizations/organizations";
import { getAllUsers } from "@/features/admin/admin";
import { useToast } from "@/components/Ui/Toast";
import Loader from "@/components/Ui/Loader";
import RoleGuard from "@/components/dashboard/role-guard";
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  PlusIcon,
  BuildingOffice2Icon,
  UsersIcon,
} from "@heroicons/react/24/outline";

// ─── Create / Edit Modal ───────────────────────────────────────────────────
function OrgFormModal({ initialValues, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(
    initialValues || { name: "", description: "" }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            {initialValues ? "Edit Organization" : "New Organization"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Organization Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Description (optional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of organization…"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              {isSaving ? "Saving…" : initialValues ? "Save Changes" : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────
function OrganizationsPanel() {
  const toast = useToast();
  const [orgs, setOrgs] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orgsRes, usersRes] = await Promise.all([getOrganizations(), getAllUsers()]);

      if (orgsRes.success && orgsRes.data?.organizations) {
        setOrgs(orgsRes.data.organizations);
      } else {
        toast.error(orgsRes.message || "Failed to load organizations.");
      }

      if (usersRes.success && usersRes.data?.users) {
        const counts = {};
        usersRes.data.users.forEach((u) => {
          if (u.organizationId) {
            counts[u.organizationId] = (counts[u.organizationId] || 0) + 1;
          }
        });
        setUserCounts(counts);
      }
    } catch {
      toast.error("Failed to load organization data.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingOrg(null);
    setShowModal(true);
  };

  const openEdit = (org) => {
    setEditingOrg(org);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (editingOrg) {
        const res = await updateOrganization(editingOrg.id || editingOrg._id, formData);
        if (res.success) {
          toast.success("Organization updated successfully.");
          setShowModal(false);
          await loadData();
        } else {
          toast.error(res.message || "Failed to update organization.");
        }
      } else {
        const res = await createOrganization(formData);
        if (res.success) {
          toast.success("Organization created successfully.");
          setShowModal(false);
          await loadData();
        } else {
          toast.error(res.message || "Failed to create organization.");
        }
      }
    } catch {
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (org) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"?`)) return;

    try {
      const res = await deleteOrganization(org.id || org._id);
      if (res.success) {
        toast.success("Organization deleted.");
        await loadData();
      } else {
        toast.error(res.message || "Failed to delete organization.");
      }
    } catch {
      toast.error("Failed to delete organization.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
            Organizations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage multi-tenant workspaces, domain slugs, and member access.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2563EB] transition active:scale-95 self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Organization</span>
        </button>
      </div>

      {/* Grid */}
      {orgs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
          <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-300 stroke-1" />
          <h3 className="mt-3 text-sm font-bold text-gray-900">No organizations found</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            Create an organization to begin partitioning projects and users.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Organization</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => {
            const orgId = org.id || org._id;
            return (
              <div
                key={orgId}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:border-[#2563EB] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 font-bold text-sm">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">{org.name}</p>
                      {org.slug && (
                        <p className="text-[11px] font-mono text-[#2563EB]">slug: {org.slug}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(org)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                      title="Edit Organization"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(org)}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                      title="Delete Organization"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {org.description && (
                  <p className="mt-3 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {org.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <UsersIcon className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span>{userCounts[orgId] || 0} members</span>
                  </div>
                  <span>
                    {new Date(org.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <OrgFormModal
          initialValues={
            editingOrg
              ? { name: editingOrg.name, description: editingOrg.description || "" }
              : null
          }
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

export default function OrganizationsPage() {
  return (
    <RoleGuard
      allowedRoles={["superadmin", "admin"]}
      fallback={
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
          Superadmin or Admin access required to manage organizations.
        </div>
      }
    >
      <OrganizationsPanel />
    </RoleGuard>
  );
}
