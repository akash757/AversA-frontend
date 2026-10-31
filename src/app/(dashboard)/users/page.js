"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAllUsers,
  createUser,
  inviteUser,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
} from "@/features/admin/admin";
import { getOrganizations } from "@/features/organizations/organizations";
import { useToast } from "@/components/Ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "@/components/Ui/Skeleton";
import RoleGuard from "@/components/dashboard/role-guard";
import {
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

const ALL_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "product_manager", label: "Product Manager" },
  { value: "project_manager", label: "Project Manager" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "qa", label: "QA" },
  { value: "sales", label: "Sales" },
  { value: "devops", label: "DevOps" },
  { value: "client", label: "Client" },
];

function CreateUserModal({ organizations, isSuperadmin, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "developer",
    organizationId: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    if (!isSuperadmin) delete payload.organizationId;

    const res = await createUser(payload);
    if (res.success) {
      toast.success("User created successfully.");
      onCreated(res.data?.user);
      onClose();
    } else {
      toast.error(res.message || "Failed to create user.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Create User</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">First Name *</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Last Name *</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
            >
              {ALL_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {isSuperadmin && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Organization *</label>
              <select
                required
                value={form.organizationId}
                onChange={(e) => setForm((prev) => ({ ...prev, organizationId: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id || org._id} value={org.id || org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteUserModal({ onClose }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const res = await inviteUser(email);
    if (res.success) {
      toast.success(`Invitation sent to ${email}`);
      onClose();
    } else {
      toast.error(res.message || "Failed to send invitation.");
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Invite User</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">User Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@agency.com"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminUsersTable() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const isSuperadmin = currentUser?.role === "superadmin";

  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ role: "", status: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, orgsRes] = await Promise.all([
        getAllUsers(),
        isSuperadmin ? getOrganizations() : Promise.resolve({ success: true, data: { organizations: [] } }),
      ]);

      if (usersRes.success && usersRes.data) {
        const raw = usersRes.data.users || usersRes.data;
        setUsers(Array.isArray(raw) ? raw : []);
      } else {
        toast.error(usersRes.message || "Failed to load team users.");
      }

      if (isSuperadmin && orgsRes.success && orgsRes.data?.organizations) {
        setOrganizations(orgsRes.data.organizations);
      }
    } catch {
      toast.error("Failed to load user management data.");
    } finally {
      setLoading(false);
    }
  }, [isSuperadmin, toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleApprove = async (id) => {
    try {
      const res = await approveUser(id);
      if (res.success) {
        toast.success("User approved.");
        void loadData();
      } else {
        toast.error(res.message || "Failed to approve user.");
      }
    } catch {
      toast.error("Failed to approve user.");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectUser(id);
      if (res.success) {
        toast.success("User rejected.");
        void loadData();
      } else {
        toast.error(res.message || "Failed to reject user.");
      }
    } catch {
      toast.error("Failed to reject user.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await deleteUser(id);
      if (res.success) {
        toast.success("User deleted.");
        void loadData();
      } else {
        toast.error(res.message || "Failed to delete user.");
      }
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const handleSaveEdit = async (id) => {
    setSavingEdit(true);
    try {
      const res = await updateUser(id, editForm);
      if (res.success) {
        toast.success("User updated.");
        setEditingId(null);
        void loadData();
      } else {
        toast.error(res.message || "Failed to update user.");
      }
    } catch {
      toast.error("Failed to update user.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Skeleton variant="line" width="16rem" height="1.75rem" />
            <Skeleton variant="line" width="22rem" height="0.875rem" />
          </div>
          <div className="flex gap-2">
            <Skeleton variant="block" width="8rem" height="2.25rem" rounded="xl" />
            <Skeleton variant="block" width="7rem" height="2.25rem" rounded="xl" />
          </div>
        </div>
        <Skeleton variant="block" width="100%" height="3rem" rounded="xl" />
        <Skeleton.Table rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
            Team & User Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage roles, workspace members, invites, and pending sign-up approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition shadow-xs"
          >
            <PaperAirplaneIcon className="h-4 w-4 text-[#2563EB]" />
            <span>Invite by Email</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2563EB] transition active:scale-95"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 uppercase tracking-wider text-[10px] font-bold text-gray-500">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {users.map((u) => {
                const uId = u.id || u._id;
                const isEditing = editingId === uId;

                return (
                  <tr key={uId} className="hover:bg-gray-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] font-bold text-xs border border-blue-100">
                          {u.firstName?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {uId.slice(-6)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">{u.email}</td>

                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700 capitalize">
                          {u.role?.replace(/_/g, " ")}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none"
                        >
                          <option value="pending">pending</option>
                          <option value="active">active</option>
                          <option value="rejected">rejected</option>
                        </select>
                      ) : (
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : u.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {u.status}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={savingEdit}
                            onClick={() => handleSaveEdit(uId)}
                            className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                            title="Save"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100"
                            title="Cancel"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {u.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(uId)}
                                className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(uId)}
                                className="rounded-lg bg-red-50 border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(uId);
                              setEditForm({ role: u.role || "developer", status: u.status || "active" });
                            }}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            title="Edit User"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(uId)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete User"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateUserModal
          organizations={organizations}
          isSuperadmin={isSuperadmin}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => void loadData()}
        />
      )}

      {showInviteModal && <InviteUserModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}

export default function UsersPage() {
  return (
    <RoleGuard
      allowedRoles={["admin", "superadmin"]}
      fallback={
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
          Admin or Superadmin access required to manage team members.
        </div>
      }
    >
      <AdminUsersTable />
    </RoleGuard>
  );
}
