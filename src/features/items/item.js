import api from "@/lib/api/api";

/**
 * Fetches extracted items for a given transcript with optional type and status filtering.
 * @param {string} transcriptId 
 * @param {{ type?: string, status?: string }} [filters]
 */
export async function getTranscriptItems(transcriptId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "all") params.append("type", filters.type);
  if (filters.status && filters.status !== "all") params.append("status", filters.status);
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/transcripts/${transcriptId}/items${queryString}`, { auth: true });
}

/**
 * Updates an extracted item (accept, reject, edit text, assign owner, set due date, replace answer).
 * @param {string} itemId 
 * @param {{
 *   status?: "proposed" | "accepted" | "rejected",
 *   text?: string,
 *   ownerParticipantId?: string | null,
 *   ownerText?: string | null,
 *   dueText?: string | null,
 *   dueDate?: string | null,
 *   replaceAnswer?: boolean
 * }} payload 
 */
export async function updateExtractedItem(itemId, payload) {
  return api.patch(`/items/${itemId}`, payload, { auth: true });
}

