/**
 * Organization Service — API calls for organization management.
 * 
 * Endpoints:
 *   GET /api/organizations/:id    (protected)
 *   PUT /api/organizations/:id    (protected)
 */

import api from "@/lib/api/api";

// ── Get All Organizations ──────────────────────────
export async function getOrganizations() {
  return api.get("/organizations", { auth: true });
}

// ── Get Organization Details ───────────────────────
export async function getOrganizationById(id) {
  return api.get(`/organizations/${id}`, { auth: true });
}

// ── Update Organization Details ────────────────────
export async function updateOrganization(id, data) {
  return api.put(`/organizations/${id}`, data, { auth: true });
}

// ── Create Organization ──────────────────────────────
export async function createOrganization(data) {
  return api.post("/organizations", data, { auth: true });
}

// ── Delete Organization ──────────────────────────────
export async function deleteOrganization(id) {
  return api.delete(`/organizations/${id}`, { auth: true });
}
