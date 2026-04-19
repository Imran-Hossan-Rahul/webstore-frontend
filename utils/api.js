/**
 * API Utility Functions
 * Centralized API calls with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get auth token from localStorage or cookies
 */
function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || null;
}

/**
 * Get account type
 */
function getHasCreatorAccount() {
  if (typeof window === "undefined") return null;
  const hasCreator = localStorage.getItem("hasCreatorAccount");
  return hasCreator === "true" || hasCreator === true;
}

/**
 * Base fetch function with auth
 */
async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = isJson
        ? data?.message || `API request failed (${response.status})`
        : `HTTP ${response.status} ${response.statusText}: ${String(data).slice(0, 300)}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * API Methods
 */
export const api = {
  // GET request
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: "GET" }),

  // POST request
  post: (endpoint, data, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PUT request
  put: (endpoint, data, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: "DELETE" }),

  // PATCH request
  patch: (endpoint, data, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // File upload
  upload: async (endpoint, formData, options = {}) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return data;
  },
};

export { getAuthToken, getHasCreatorAccount, API_BASE_URL };

