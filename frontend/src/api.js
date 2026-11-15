const BASE_URL = "http://127.0.0.1:8000/api";

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Ошибка запроса");
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

export function fetchProperties(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/properties/${query ? "?" + query : ""}`);
}

export function fetchPropertyTypes() {
  return request("/property-types/");
}

export function fetchAgents() {
  return request("/agents/");
}

export function fetchBlogPosts() {
  return request("/blog/");
}

export function createViewingRequest(payload) {
  return request("/requests/", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchRequests() {
  return request("/requests/");
}

export function createProperty(payload) {
  return request("/properties/", { method: "POST", body: JSON.stringify(payload) });
}

export function login(username, password) {
  return request("/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function register(username, password, firstName) {
  return request("/register/", {
    method: "POST",
    body: JSON.stringify({ username, password, first_name: firstName }),
  });
}

export function logout() {
  return request("/logout/", { method: "POST" });
}

export function fetchCurrentUser() {
  return request("/current-user/");
}