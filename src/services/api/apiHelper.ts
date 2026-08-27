// Simulated network latency
export const delay = (ms: number = 400): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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
