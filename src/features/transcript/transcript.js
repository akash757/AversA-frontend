import api from "@/lib/api/api";

export async function previewTranscript(projectId, payload) {
  return api.post(`/projects/${projectId}/transcripts/preview`, payload, { auth: true });
}

export async function uploadTranscript(projectId, payload) {
  return api.post(`/projects/${projectId}/transcripts`, payload, { auth: true });
}

export async function getProjectTranscripts(projectId) {
  return api.get(`/projects/${projectId}/transcripts`, { auth: true });
}

export async function getTranscriptById(transcriptId, includeRawText = false) {
  const query = includeRawText ? "?includeRawText=true" : "";
  return api.get(`/transcripts/${transcriptId}${query}`, { auth: true });
}

export async function deleteTranscript(transcriptId) {
  return api.delete(`/transcripts/${transcriptId}`, { auth: true });
}

