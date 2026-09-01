// Dairy Nova API Helper & Storage Utilities

const resolveApiBaseUrl = (): string => {
  const envObj = (import.meta as any).env || {};
  const rawUrl: string =
    envObj.VITE_API_BASE_URL ||
    envObj.VITE_API_URL ||
    '';

  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim()) {
    const trimmed = rawUrl.trim().replace(/\/+$/, '');
    if (trimmed.endsWith('/api/v1')) {
      return trimmed;
    }
    if (trimmed.endsWith('/api')) {
      return `${trimmed}/v1`;
    }
    return `${trimmed}/api/v1`;
  }

  return 'https://dairy-ai-assistant.onrender.com/api/v1';
};

export const API_BASE_URL = resolveApiBaseUrl();

// Simulated latency for smooth UI transitions when needed
export const delay = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Local Storage Wrappers
export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`dairynova_${key}`);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Error reading localStorage for key "dairynova_${key}":`, e);
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`dairynova_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving to localStorage for key "dairynova_${key}":`, e);
  }
}

export function removeStoredItem(key: string): void {
  try {
    localStorage.removeItem(`dairynova_${key}`);
  } catch (e) {
    console.warn(`Error removing localStorage for key "dairynova_${key}":`, e);
  }
}

/**
 * Retrieve active authentication token.
 * Returns the exact backend session/bearer token or null if unauthenticated.
 * NEVER silently fabricates a fake or demo token.
 */
export function getAuthToken(): string | null {
  try {
    const directToken = getStoredItem<string | null>('auth_token', null) || localStorage.getItem('auth_token');
    if (directToken && directToken.trim()) return directToken.trim();

    const activeUser = getStoredItem<any>('active_user', null);
    if (activeUser?.token && typeof activeUser.token === 'string' && activeUser.token.trim()) {
      return activeUser.token.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Retrieve active authenticated user ID.
 * Returns the real authenticated user ID or null if unauthenticated.
 */
export function getAuthUserId(): string | null {
  try {
    const directUserId = getStoredItem<string | null>('user_id', null) || localStorage.getItem('user_id');
    if (directUserId && directUserId.trim()) return directUserId.trim();

    const activeUser = getStoredItem<any>('active_user', null);
    if (activeUser?.id && typeof activeUser.id === 'string' && activeUser.id.trim()) {
      return activeUser.id.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Persist active authentication credentials across standard storage keys.
 */
export function setAuthCredentials(token: string, userId: string): void {
  setStoredItem('auth_token', token);
  setStoredItem('user_id', userId);
  try {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', userId);
  } catch {
    // ignore
  }
}

/**
 * Clear authentication credentials on logout.
 */
export function clearAuthCredentials(): void {
  removeStoredItem('auth_token');
  removeStoredItem('user_id');
  removeStoredItem('active_user');
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  } catch {
    // ignore
  }
}

/**
 * Centralized authentication and header builder.
 * Attaches real Bearer authorization token and X-User-ID when available.
 * Never sets Content-Type for FormData requests to let browser compute multipart boundaries.
 */
export function getAuthHeaders(
  customHeaders?: HeadersInit,
  isFormData: boolean = false,
  requireAuth: boolean = false
): Record<string, string> {
  const token = getAuthToken();
  const userId = getAuthUserId();

  if (requireAuth && !token) {
    throw new Error('Authentication required. Please log in with your phone number.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['X-User-ID'] = userId;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        if (!isFormData || key.toLowerCase() !== 'content-type') {
          headers[key] = value;
        }
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => {
        if (!isFormData || key.toLowerCase() !== 'content-type') {
          headers[key] = value;
        }
      });
    } else {
      Object.entries(customHeaders).forEach(([key, value]) => {
        if (value !== undefined && (!isFormData || key.toLowerCase() !== 'content-type')) {
          headers[key] = String(value);
        }
      });
    }
  }

  return headers;
}

/**
 * Format server or network errors into informative, farmer-friendly messages
 */
export function formatFarmerErrorMessage(error: any, status?: number): string {
  if (!navigator.onLine) {
    return 'Internet connection unavailable. You are currently offline. Local actions will sync when connected.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  if (error?.name === 'AbortError' || error?.message?.includes('aborted') || error?.message?.includes('timeout')) {
    return 'AI service is waking up or request timed out. Please wait a moment and try again.';
  }

  if (status === 400 || status === 422) {
    const rawDetail = error?.detail || error?.message || '';
    if (typeof rawDetail === 'string' && rawDetail.length > 0 && !rawDetail.includes('Traceback')) {
      return `Some test information is missing or invalid: ${rawDetail}`;
    }
    return 'Some test information is missing or invalid. Please check the values and retry.';
  }

  if (status === 401 || status === 403) {
    return 'Session expired or unauthorized. Please log in with your phone number again.';
  }

  if (status === 404) {
    return 'Requested dairy record or AI model resource was not found on the server.';
  }

  if (error?.error_type === 'ModelInferenceError' || error?.message?.includes('Inference failed') || error?.message?.includes('ModelInferenceError')) {
    const detailMsg = error?.details?.error || error?.message || '';
    return `AI model is currently unavailable on the server (${detailMsg || 'Model Inference Error'}). Please consult a certified veterinarian.`;
  }

  if (status === 502 || status === 503 || status === 504) {
    return 'The AI backend server is currently starting up or experiencing high load. Please try again in 30 seconds.';
  }

  if (status && status >= 500) {
    const backendMsg = error?.message || error?.detail;
    if (backendMsg && typeof backendMsg === 'string' && !backendMsg.includes('Traceback') && backendMsg.length < 150) {
      return `AI analysis is temporarily unavailable (${backendMsg}). Please try again.`;
    }
    return 'AI analysis is temporarily unavailable on the server. Please try again in a few moments.';
  }

  if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
    return `Unable to connect to the backend server (${API_BASE_URL}). Please verify that the backend is running and reachable.`;
  }

  return error?.message || 'Unable to connect to the AI service. Please check your connection and try again.';
}

export function buildApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/api/v1') && API_BASE_URL.endsWith('/api/v1')) {
    return `${API_BASE_URL.slice(0, -7)}${cleanPath}`;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

// Unified API fetcher with automatic auth injection, timeout, and farmer-friendly error handling
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = 40000,
  requireAuth: boolean = false
): Promise<T> {
  const url = buildApiUrl(path);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const mergedHeaders = getAuthHeaders(options.headers, isFormData, requireAuth);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: mergedHeaders,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorJson: any = null;
      try {
        errorJson = await response.json();
      } catch {
        errorJson = { message: response.statusText };
      }
      const farmerMsg = formatFarmerErrorMessage(errorJson, response.status);
      const err = new Error(farmerMsg);
      (err as any).status = response.status;
      (err as any).rawError = errorJson;
      throw err;
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (!error.status) {
      const friendlyMsg = formatFarmerErrorMessage(error);
      const err = new Error(friendlyMsg);
      (err as any).original = error;
      throw err;
    }
    throw error;
  }
}
