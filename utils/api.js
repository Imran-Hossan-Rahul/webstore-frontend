/**
 * API Utility — Codalina
 * 
 * Centralized API client with:
 *  - Automatic httpOnly cookie auth (credentials: "include")
 *  - CSRF token injection on every mutating request
 *  - Smart body serialization (JSON vs FormData)
 *  - Consistent error shape for all callers
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── CSRF ────────────────────────────────────────────────────────────────────

/**
 * Reads the XSRF-TOKEN cookie set by the backend.
 * Returns null during SSR (no `document`).
 */
function getCsrfToken() {
  if (typeof window === "undefined") return null;
  
  // 1. Try reading from cookie (works if on same domain/port)
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  // 2. Fallback to localStorage (needed for cross-port development)
  return localStorage.getItem("XSRF-TOKEN");
}

/**
 * Persists the CSRF token for cross-port development.
 */
function setCsrfToken(token) {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("XSRF-TOKEN", token);
  }
}

// ─── UI HELPERS ──────────────────────────────────────────────────────────────

/**
 * Cheap synchronous check for UI gating (non-sensitive).
 * Actual auth truth lives in the httpOnly cookie verified server-side.
 */
function getHasCraftsmanAccount() {
  if (typeof window === "undefined") return false;
  const v = localStorage.getItem("hasCraftsmanAccount");
  return v === "true";
}

/**
 * Returns true if a `userId` is stored — a fast UI-only guard.
 * Never use this for actual security decisions.
 */
function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("userId"));
}

/**
 * Reads the accessToken from the stored user object in localStorage.
 * Used as a backup Authorization header for cross-origin or file upload requests.
 */
function getAccessToken() {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.accessToken || null;
    }
  } catch (e) {
    console.error("Failed to parse user from localStorage:", e);
  }
  return null;
}

// ─── CORE FETCH ──────────────────────────────────────────────────────────────

/**
 * Base fetch wrapper. All api.* methods route through here.
 *
 * Handles:
 *  - JSON bodies (default)
 *  - FormData bodies (skips Content-Type so browser sets multipart boundary)
 *  - CSRF injection
 *  - Error normalization
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const csrfToken = getCsrfToken();
  const accessToken = getAccessToken();

  const isFormData = options.body instanceof FormData;

  // For FormData we must NOT set Content-Type — browser does it automatically
  // with the correct multipart boundary.
  const headers = isFormData
    ? { "X-XSRF-TOKEN": csrfToken, ...options.headers }
    : { "Content-Type": "application/json", "X-XSRF-TOKEN": csrfToken, ...options.headers };

  // Strip null/undefined CSRF (e.g. during SSR or on GET requests)
  if (!csrfToken) delete headers["X-XSRF-TOKEN"];

  // Append Bearer token as a robust double-defense for cross-origin or upload requests
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include", // Always send httpOnly cookies
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = isJson
        ? data?.message || `Request failed (${response.status})`
        : `HTTP ${response.status}: ${String(data).slice(0, 200)}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// ─── API METHODS ─────────────────────────────────────────────────────────────

export const api = {
  /**
   * GET — read data
   */
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: "GET" }),

  /**
   * POST — create / mutate
   * Accepts a plain object (JSON) or a FormData instance (file upload).
   */
  post: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  /**
   * PUT — full replacement
   */
  put: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  /**
   * PATCH — partial update
   */
  patch: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return apiFetch(endpoint, {
      ...options,
      method: "PATCH",
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  /**
   * DELETE — remove resource
   */
  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: "DELETE" }),

  /**
   * UPLOAD — explicit file upload helper (alias for api.post with FormData)
   * Kept for backward compatibility with existing callers.
   */
  upload: (endpoint, formData, method = "POST", options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method,
      body: formData, // FormData — apiFetch auto-detects
    }),
};

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export { getHasCraftsmanAccount, isAuthenticated, setCsrfToken, API_BASE_URL };
