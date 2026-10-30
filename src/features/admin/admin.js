import api from "@/lib/api/api";

/**
 * Fetch all users (Admin / Superadmin only)
 */
export async function getAllUsers() {
  try {
    const res = await api.get("/admin/users", { auth: true });
    return { success: res.success !== false, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch users.",
    };
  }
}

/**
 * Directly create a user with a role (Admin / Superadmin only)
 * - Superadmin must supply organizationId to bind the user to an org
 * - Admin automatically gets their own org assigned by the backend
 */
export async function createUser(payload) {
  try {
    const res = await api.post("/admin/users", payload, { auth: true });
    return { success: res.success !== false, data: res.data, message: res.message };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create user.",
    };
  }
}

/**
 * Invite a user via email (Admin only)
 */
export async function inviteUser(email) {
  try {
    const res = await api.post("/admin/users/invite", { email }, { auth: true });
    return { success: res.success !== false, data: res.data, message: res.message };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to send invitation.",
    };
  }
}

/**
 * Approve a pending user (Admin only)
 */
export async function approveUser(userId) {
  try {
    const res = await api.patch(`/admin/users/${userId}/approve`, {}, { auth: true });
    return { success: res.success !== false, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to approve user.",
    };
  }
}

/**
 * Reject and delete a pending user (Admin only)
 */
export async function rejectUser(userId) {
  try {
    const res = await api.patch(`/admin/users/${userId}/reject`, {}, { auth: true });
    return { success: res.success !== false, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to reject user.",
    };
  }
}

/**
 * Update a user completely (Admin only)
 */
export async function updateUser(userId, payload) {
  try {
    const res = await api.patch(`/admin/users/${userId}`, payload, { auth: true });
    return { success: res.success !== false, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to update user.",
    };
  }
}

/**
 * Hard delete a user (Admin only)
 */
export async function deleteUser(userId) {
  try {
    const res = await api.delete(`/admin/users/${userId}`, { auth: true });
    return { success: res.success !== false, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to delete user.",
    };
  }
}
