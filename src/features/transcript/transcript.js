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

export async function getTranscriptSpeakers(transcriptId) {
  return api.get(`/transcripts/${transcriptId}/speakers`, { auth: true });
}

export async function mapTranscriptSpeakers(transcriptId, mappings) {
  return api.post(`/transcripts/${transcriptId}/speakers/map`, { mappings }, { auth: true });
}

export async function triggerTranscriptAnalysis(transcriptId) {
  return api.post(`/transcripts/${transcriptId}/analysis`, {}, { auth: true });
}

export async function getTranscriptAnalysisStatus(transcriptId) {
  return api.get(`/transcripts/${transcriptId}/analysis/status`, { auth: true });
}

export async function getProjectParticipants(projectId) {
  return api.get(`/projects/${projectId}/participants`, { auth: true });
}
