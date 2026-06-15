const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("opntus_token") : null;
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...opts.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  startSession: (mood: string) => request<{ sessionId: string; anonymousName: string }>("/auth/user/start", { method: "POST", body: JSON.stringify({ mood }) }),
  submitFeedback: (sessionId: string, body: object) => request(`/sessions/${sessionId}/feedback`, { method: "POST", body: JSON.stringify(body) }),
  getMetrics: () => request("/admin/metrics"),
  getListeners: () => request("/admin/listeners"),
  updateListenerStatus: (id: string, status: string) => request(`/admin/listeners/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getReports: (status?: string) => request(`/admin/reports${status ? `?status=${status}` : ""}`),
  fileReport: (sessionId: string, reason: string) => request(`/sessions/${sessionId}/report`, { method: "POST", body: JSON.stringify({ reason, reporterType: "user" }) }),
};
