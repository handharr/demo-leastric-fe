/**
 * Local storage management utility with enum-like keys
 */

// Storage keys enum-like object
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
  USER_PREFERENCES: "userPreferences",
  THEME: "theme",
  LANGUAGE: "language",
  USER_DATA: "userData",
} as const;

// Type for storage keys
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// Storage options interface
export interface StorageOptions {
  useSessionStorage?: boolean;
  expiryInMinutes?: number;
}

// Storage item with expiry
interface StorageItem<T> {
  value: T;
  expiry?: number;
}

export class StorageManager {
  private static getStorage({
    useSessionStorage = false,
  }: { useSessionStorage?: boolean } = {}): Storage {
    if (typeof window === "undefined") {
      throw new Error("Storage is not available in server-side environment");
    }
    return useSessionStorage ? sessionStorage : localStorage;
  }

  /**
   * Set item in storage with optional expiry
   */
  static setItem<T>({
    key,
    value,
    options = {},
  }: {
    key: StorageKey;
    value: T;
    options?: StorageOptions;
  }): void {
    try {
      const { useSessionStorage = false, expiryInMinutes } = options;
      const storage = this.getStorage({ useSessionStorage });

      const item: StorageItem<T> = {
        value,
        expiry: expiryInMinutes
          ? Date.now() + expiryInMinutes * 60 * 1000
          : undefined,
      };

      storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Failed to set storage item ${key}:`, error);
    }
  }

  /**
   * Get item from storage with expiry check
   */
  static getItem<T>({
    key,
    options = {},
  }: {
    key: StorageKey;
    options?: StorageOptions;
  }): T | null {
    try {
      const { useSessionStorage = false } = options;
      const storage = this.getStorage({ useSessionStorage });
      const itemStr = storage.getItem(key);

      if (!itemStr) {
        return null;
      }

      const item: StorageItem<T> = JSON.parse(itemStr);

      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.removeItem({ key, options });
        return null;
      }

      return item.value;
    } catch (error) {
      console.error(`Failed to get storage item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  static removeItem({
    key,
    options = {},
  }: {
    key: StorageKey;
    options?: StorageOptions;
  }): void {
    try {
      const { useSessionStorage = false } = options;
      const storage = this.getStorage({ useSessionStorage });
      storage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove storage item ${key}:`, error);
    }
  }

  /**
   * Remove multiple items from storage
   */
  static removeItems({
    keys,
    options = {},
  }: {
    keys: StorageKey[];
    options?: StorageOptions;
  }): void {
    keys.forEach((key) => this.removeItem({ key, options }));
  }

  /**
   * Clear all items with specific prefix
   */
  static clearByPrefix({
    prefix,
    options = {},
  }: {
    prefix: string;
    options?: StorageOptions;
  }): void {
    try {
      const { useSessionStorage = false } = options;
      const storage = this.getStorage({ useSessionStorage });
      const keysToRemove: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
    } catch (error) {
      console.error(`Failed to clear storage by prefix ${prefix}:`, error);
    }
  }

  /**
   * Check if item exists and is not expired
   */
  static hasItem({
    key,
    options = {},
  }: {
    key: StorageKey;
    options?: StorageOptions;
  }): boolean {
    return this.getItem({ key, options }) !== null;
  }

  /**
   * Get all storage keys
   */
  static getAllKeys({
    options = {},
  }: {
    options?: StorageOptions;
  } = {}): string[] {
    try {
      const { useSessionStorage = false } = options;
      const storage = this.getStorage({ useSessionStorage });
      const keys: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          keys.push(key);
        }
      }

      return keys;
    } catch (error) {
      console.error("Failed to get all storage keys:", error);
      return [];
    }
  }

  /**
   * Clear all storage
   */
  static clearAll({
    options = {},
  }: {
    options?: StorageOptions;
  } = {}): void {
    try {
      const { useSessionStorage = false } = options;
      const storage = this.getStorage({ useSessionStorage });
      storage.clear();
    } catch (error) {
      console.error("Failed to clear all storage:", error);
    }
  }
}

// Convenience functions for common operations
export const storage = {
  // Auth token management
  setAuthToken: ({
    token,
    options,
  }: {
    token: string;
    options?: StorageOptions;
  }) =>
    StorageManager.setItem({
      key: STORAGE_KEYS.AUTH_TOKEN,
      value: token,
      options,
    }),

  getAuthToken: ({ options }: { options?: StorageOptions } = {}):
    | string
    | null =>
    StorageManager.getItem<string>({ key: STORAGE_KEYS.AUTH_TOKEN, options }),

  removeAuthToken: ({ options }: { options?: StorageOptions } = {}) =>
    StorageManager.removeItem({ key: STORAGE_KEYS.AUTH_TOKEN, options }),

  // Refresh token management
  setRefreshToken: ({
    token,
    options,
  }: {
    token: string;
    options?: StorageOptions;
  }) =>
    StorageManager.setItem({
      key: STORAGE_KEYS.REFRESH_TOKEN,
      value: token,
      options,
    }),

  getRefreshToken: ({ options }: { options?: StorageOptions } = {}):
    | string
    | null =>
    StorageManager.getItem<string>({
      key: STORAGE_KEYS.REFRESH_TOKEN,
      options,
    }),

  removeRefreshToken: ({ options }: { options?: StorageOptions } = {}) =>
    StorageManager.removeItem({ key: STORAGE_KEYS.REFRESH_TOKEN, options }),

  // Clear all auth data
  clearAuthData: ({ options }: { options?: StorageOptions } = {}) => {
    StorageManager.removeItems({
      keys: [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.REFRESH_TOKEN],
      options,
    });
  },

  // User preferences
  setUserPreferences: ({
    preferences,
    options,
  }: {
    preferences: Record<string, unknown>;
    options?: StorageOptions;
  }) =>
    StorageManager.setItem({
      key: STORAGE_KEYS.USER_PREFERENCES,
      value: preferences,
      options,
    }),

  getUserPreferences: ({
    options,
  }: {
    options?: StorageOptions;
  } = {}): Record<string, unknown> | null =>
    StorageManager.getItem<Record<string, unknown>>({
      key: STORAGE_KEYS.USER_PREFERENCES,
      options,
    }),

  // Theme management
  setTheme: ({ theme, options }: { theme: string; options?: StorageOptions }) =>
    StorageManager.setItem({ key: STORAGE_KEYS.THEME, value: theme, options }),

  getTheme: ({ options }: { options?: StorageOptions } = {}): string | null =>
    StorageManager.getItem<string>({ key: STORAGE_KEYS.THEME, options }),

  // Language management
  setLanguage: ({
    language,
    options,
  }: {
    language: string;
    options?: StorageOptions;
  }) =>
    StorageManager.setItem({
      key: STORAGE_KEYS.LANGUAGE,
      value: language,
      options,
    }),

  getLanguage: ({ options }: { options?: StorageOptions } = {}):
    | string
    | null =>
    StorageManager.getItem<string>({ key: STORAGE_KEYS.LANGUAGE, options }),
};
