import api from "@/lib/api/api";

export async function getProjects() {
  return api.get("/projects", { auth: true });
}

export async function getProjectById(projectId) {
  return api.get(`/projects/${projectId}`, { auth: true });
}

export async function createProject(payload) {
  return api.post("/projects", payload, { auth: true });
}

export async function updateProject(projectId, payload) {
  return api.put(`/projects/${projectId}`, payload, { auth: true });
}

export async function updateProjectStage(projectId, stage) {
  return api.patch(`/projects/${projectId}/stage`, { stage }, { auth: true });
}

export async function deleteProject(projectId) {
  return api.delete(`/projects/${projectId}`, { auth: true });
}

export async function getProjectQuestions(projectId, status = "") {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return api.get(`/projects/${projectId}/questions${query}`, { auth: true });
}

export async function createProjectQuestion(projectId, payload) {
  return api.post(`/projects/${projectId}/questions`, payload, { auth: true });
}

export async function updateProjectQuestion(questionId, payload, projectId = null) {
  const endpoint = projectId
    ? `/projects/${projectId}/questions/${questionId}`
    : `/projects/questions/${questionId}`;
  return api.patch(endpoint, payload, { auth: true });
}

export async function deleteProjectQuestion(questionId, projectId = null) {
  const endpoint = projectId
    ? `/projects/${projectId}/questions/${questionId}`
    : `/projects/questions/${questionId}`;
  return api.delete(endpoint, { auth: true });
}

export async function getProjectContacts(projectId) {
  return api.get(`/projects/${projectId}/contacts`, { auth: true });
}

export async function createProjectContact(projectId, payload) {
  return api.post(`/projects/${projectId}/contacts`, payload, { auth: true });
}

export async function updateProjectContact(projectId, contactId, payload) {
  return api.patch(`/projects/${projectId}/contacts/${contactId}`, payload, { auth: true });
}

export async function deleteProjectContact(projectId, contactId) {
  return api.delete(`/projects/${projectId}/contacts/${contactId}`, { auth: true });
}

export async function regenerateProjectAiSuggestions(projectId) {
  return api.post(`/projects/${projectId}/suggestions/generate`, {}, { auth: true });
}

export async function getProjectSuggestionsStatus(projectId) {
  return api.get(`/projects/${projectId}/suggestions/status`, { auth: true });
}

export async function searchProjectByKeyword(projectId, keyword) {
  return api.get(`/projects/${projectId}/search?keyword=${encodeURIComponent(keyword)}`, { auth: true });
}
