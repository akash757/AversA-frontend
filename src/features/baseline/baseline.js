import api from "@/lib/api/api";

/**
 * Creates a new draft requirement baseline snapshot.
 * Managers only.
 * @param {string} projectId 
 * @param {{ note?: string }} [payload]
 */
export async function createDraftBaseline(projectId, payload = {}) {
  return api.post(`/projects/${projectId}/baselines`, payload, { auth: true });
}

/**
 * Lists all baseline versions for a project sorted by version descending.
 * @param {string} projectId 
 */
export async function getProjectBaselines(projectId) {
  return api.get(`/projects/${projectId}/baselines`, { auth: true });
}

/**
 * Retrieves the current confirmed requirement baseline with its ordered items.
 * @param {string} projectId 
 */
export async function getLatestConfirmedBaseline(projectId) {
  return api.get(`/projects/${projectId}/baselines/latest`, { auth: true });
}

/**
 * Retrieves a single baseline by ID with its ordered items.
 * @param {string} baselineId 
 */
export async function getBaselineById(baselineId) {
  return api.get(`/baselines/${baselineId}`, { auth: true });
}

/**
 * Adds a manual item (decision, requirement, or answer) to a draft baseline.
 * @param {string} baselineId 
 * @param {{
 *   type: "requirement" | "decision" | "answer",
 *   text: string,
 *   questionText?: string,
 *   topicKey?: string
 * }} payload 
 */
export async function addBaselineItem(baselineId, payload) {
  return api.post(`/baselines/${baselineId}/items`, payload, { auth: true });
}

/**
 * Edits an item inside a draft baseline snapshot without touching source items.
 * @param {string} baselineId 
 * @param {string} itemId 
 * @param {{
 *   text?: string,
 *   questionText?: string,
 *   topicKey?: string
 * }} payload 
 */
export async function updateBaselineItem(baselineId, itemId, payload) {
  return api.patch(`/baselines/${baselineId}/items/${itemId}`, payload, { auth: true });
}

/**
 * Deletes an item from the draft baseline snapshot only.
 * @param {string} baselineId 
 * @param {string} itemId 
 */
export async function deleteBaselineItem(baselineId, itemId) {
  return api.delete(`/baselines/${baselineId}/items/${itemId}`, { auth: true });
}

/**
 * Updates the draft baseline's note.
 * @param {string} baselineId 
 * @param {{ note: string | null }} payload 
 */
export async function updateBaselineNote(baselineId, payload) {
  return api.patch(`/baselines/${baselineId}`, payload, { auth: true });
}

/**
 * Freezes / confirms a draft baseline snapshot into confirmed status.
 * @param {string} baselineId 
 * @param {{ acknowledgeWarnings?: boolean }} [payload] 
 */
export async function confirmBaseline(baselineId, payload = {}) {
  return api.post(`/baselines/${baselineId}/confirm`, payload, { auth: true });
}

/**
 * Discards a draft baseline and permanently deletes its draft items.
 * @param {string} baselineId 
 */
export async function discardDraftBaseline(baselineId) {
  return api.delete(`/baselines/${baselineId}`, { auth: true });
}

