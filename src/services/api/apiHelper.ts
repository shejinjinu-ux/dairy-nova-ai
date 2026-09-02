// Dairy Nova API Helper & Storage Utilities

const resolveApiBaseUrl = (): string => {
  const envObj = (import.meta as any).env || {};
  const isDev = Boolean(envObj.DEV);
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

  // In development mode, allow default local FastAPI backend
  if (isDev) {
    return 'http://127.0.0.1:8000/api/v1';
  }

  // In production mode, NEVER fall back to localhost / 127.0.0.1
  return '';
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
 * Retrieve active authenticated user phone number.
 */
export function getAuthPhone(): string | null {
  try {
    const directPhone = getStoredItem<string | null>('user_phone', null) || localStorage.getItem('user_phone');
    if (directPhone && directPhone.trim()) return directPhone.trim();

    const activeUser = getStoredItem<any>('active_user', null);
    if (activeUser?.mobile && typeof activeUser.mobile === 'string' && activeUser.mobile.trim()) {
      return activeUser.mobile.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Persist active authentication credentials across standard storage keys.
 */
export function setAuthCredentials(token: string, userId: string, phone?: string): void {
  setStoredItem('auth_token', token);
  setStoredItem('user_id', userId);
  if (phone && phone.trim()) {
    setStoredItem('user_phone', phone.trim());
  }
  try {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', userId);
    if (phone && phone.trim()) {
      localStorage.setItem('user_phone', phone.trim());
    }
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
  removeStoredItem('user_phone');
  removeStoredItem('active_user');
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_phone');
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
  // Explicit configuration error check for production deployment
  if (
    typeof error?.message === 'string' &&
    error.message.includes('Production backend API URL is not configured')
  ) {
    return error.message;
  }

  if (!API_BASE_URL && !(import.meta as any).env?.DEV) {
    return 'Production backend API URL is not configured. Please set the VITE_API_BASE_URL environment variable in your Vercel deployment settings.';
  }

  if (!navigator.onLine) {
    return 'Internet connection unavailable. You are currently offline. Local actions will sync when connected.';
  }

  // Detect network unreachable / failed to fetch conditions
  const isNetworkError =
    !status ||
    status === 0 ||
    error instanceof TypeError ||
    error?.name === 'TypeError' ||
    (typeof error?.message === 'string' &&
      (error.message.includes('fetch') ||
       error.message.includes('Failed to fetch') ||
       error.message.includes('NetworkError') ||
       error.message.includes('Network request failed') ||
       error.message.includes('network issue') ||
       error.message.includes('ECONNREFUSED') ||
       error.message.includes('Failed to load resource') ||
       error.message.includes('Unknown'))) ||
    (typeof error?.detail === 'string' &&
      (error.detail.includes('network issue') || error.detail.includes('connection refused')));

  if (isNetworkError && (!status || status === 0)) {
    return 'Cannot connect to the backend server. Make sure the FastAPI server is running.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  if (error?.name === 'AbortError' || error?.message?.includes('aborted') || error?.message?.includes('timeout')) {
    return 'The request timed out. Please verify that the FastAPI backend server is responsive.';
  }

  if (status === 400 || status === 422) {
    const rawDetail = error?.detail || error?.message || '';
    if (typeof rawDetail === 'string' && rawDetail.trim().length > 0 && !rawDetail.includes('Traceback')) {
      if (
        rawDetail.toLowerCase().includes('otp') ||
        rawDetail.toLowerCase().includes('phone') ||
        rawDetail.toLowerCase().includes('auth') ||
        rawDetail.toLowerCase().includes('credential')
      ) {
        return rawDetail;
      }
      return rawDetail.length < 120 ? rawDetail : `Invalid request: ${rawDetail}`;
    }
    return 'Invalid request information. Please check the values and retry.';
  }

  if (status === 401 || status === 403) {
    const rawDetail = error?.detail || error?.message || '';
    if (typeof rawDetail === 'string' && rawDetail.trim().length > 0 && !rawDetail.includes('Traceback')) {
      return rawDetail;
    }
    return 'Session expired or unauthorized. Please log in with your phone number again.';
  }

  if (status === 404) {
    const rawDetail = error?.detail || error?.message || '';
    if (typeof rawDetail === 'string' && rawDetail.trim().length > 0 && !rawDetail.includes('Traceback') && rawDetail.length < 120) {
      return rawDetail;
    }
    return 'Requested dairy record or API resource was not found on the server.';
  }

  if (error?.error_type === 'ModelInferenceError' || error?.message?.includes('Inference failed') || error?.message?.includes('ModelInferenceError')) {
    const detailMsg = error?.details?.error || error?.message || '';
    return `AI model is currently unavailable on the server (${detailMsg || 'Model Inference Error'}). Please consult a certified veterinarian.`;
  }

  if (status === 502 || status === 503 || status === 504) {
    return 'The AI backend server is currently starting up or unreachable. Please verify that the FastAPI server is running.';
  }

  if (status && status >= 500) {
    const backendMsg = error?.message || error?.detail;
    if (backendMsg && typeof backendMsg === 'string' && !backendMsg.includes('Traceback') && backendMsg.length < 150) {
      return `Backend server error (${backendMsg}). Please try again.`;
    }
    return 'Backend server encountered an error. Please try again in a few moments.';
  }

  const genericMsg = error?.message || error?.detail;
  if (typeof genericMsg === 'string' && genericMsg.trim() && !genericMsg.includes('Unknown:')) {
    return genericMsg;
  }

  return 'Cannot connect to the backend server. Make sure the FastAPI server is running.';
}

export function buildApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (!API_BASE_URL) {
    throw new Error(
      'Production backend API URL is not configured. Please set the VITE_API_BASE_URL environment variable in your Vercel deployment settings.'
    );
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
