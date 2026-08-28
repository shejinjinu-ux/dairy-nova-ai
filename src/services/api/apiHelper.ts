// Dairy Nova API Helper & Storage Utilities

export const API_BASE_URL =
  ((import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL) ||
  'https://dairy-ai-assistant.onrender.com/api/v1';

// Simulated latency for smooth UI transitions when needed
export const delay = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Connecting to Dairy Nova AI server… The service may take a moment to wake up.';
  }

  return error?.message || 'Unable to connect to the AI service. Please check your connection and try again.';
}

// Unified API fetcher with timeout and farmer-friendly error handling
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = 40000
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
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
