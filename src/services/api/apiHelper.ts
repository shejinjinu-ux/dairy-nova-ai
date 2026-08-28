// Dairy Nova API Helper & Storage Utilities

export const API_BASE_URL =
  ((import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL) ||
  'https://dairy-ai-assistant.onrender.com/api/v1';

// Simulated latency for smooth UI transitions when needed
export const delay = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Format server or network errors into farmer-friendly messages
 */
export function formatFarmerErrorMessage(error: any, status?: number): string {
  if (!navigator.onLine) {
    return 'You are currently offline. Actions will be saved locally and synced when connection returns.';
  }

  if (error?.name === 'AbortError' || error?.message?.includes('aborted') || error?.message?.includes('timeout')) {
    return 'AI service is waking up or taking longer than expected. Please wait a moment and try again.';
  }

  if (status === 400 || status === 422) {
    const rawDetail = error?.detail || error?.message || '';
    if (typeof rawDetail === 'string' && rawDetail.length > 0 && !rawDetail.includes('Traceback')) {
      return `Please check input details: ${rawDetail}`;
    }
    return 'Invalid input details provided. Please verify the entered information and try again.';
  }

  if (status === 401 || status === 403) {
    return 'Session expired or unauthorized. Please log in with your phone number again.';
  }

  if (status === 404) {
    return 'Requested dairy record or AI model resource was not found.';
  }

  if (status && status >= 500) {
    return 'The AI service encountered a temporary hiccup. Please try again in a few moments.';
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Connecting to Dairy Nova AI… If this is the first request, the AI service may take a moment to wake up.';
  }

  return error?.message || 'Unable to connect to the AI service. Please check your connection and try again.';
}

// Unified API fetcher with timeout and farmer-friendly error handling
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
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
      const customErr = new Error(friendlyMsg);
      (customErr as any).original = error;
      throw customErr;
    }
    throw error;
  }
}

// LocalStorage helpers with automatic JSON serialization
export const getStoredItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`dairynova_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key dairynova_${key}:`, error);
    return defaultValue;
  }
};

export const setStoredItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`dairynova_${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving to localStorage key dairynova_${key}:`, error);
  }
};

