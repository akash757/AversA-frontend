import api from "@/lib/api/api";

export async function getMeetingsByProject(projectId) {
  return api.get(`/projects/${projectId}/meetings`, { auth: true });
}

export async function getMeetingsByOrganization() {
  return api.get("/meetings/org", { auth: true });
}

export async function createMeeting(projectId, payload) {
  if (projectId) {
    return api.post(`/projects/${projectId}/meetings`, payload, { auth: true });
  }
  return api.post("/meetings", payload, { auth: true });
}

export async function updateMeeting(projectId, meetingId, payload) {
  if (projectId) {
    return api.put(`/projects/${projectId}/meetings/${meetingId}`, payload, { auth: true });
  }
  return api.put(`/meetings/${meetingId}`, payload, { auth: true });
}

export async function deleteMeeting(projectId, meetingId) {
  if (projectId) {
    return api.delete(`/projects/${projectId}/meetings/${meetingId}`, { auth: true });
  }
  return api.delete(`/meetings/${meetingId}`, { auth: true });
}
