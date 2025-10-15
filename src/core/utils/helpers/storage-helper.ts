/**
 * Local storage management utility with enum-like keys for web-leastric application.
 * Provides type-safe storage operations with expiry support and SSR compatibility.
 * Handles both localStorage and sessionStorage with automatic error handling.
 */

/**
 * Predefined storage keys for consistent access across the application.
 * Using const assertion to ensure type safety and prevent key typos.
 *
 * @example
 * ```typescript
 * // Accessing storage keys
 * console.log(STORAGE_KEYS.AUTH_TOKEN); // "authToken"
 * console.log(STORAGE_KEYS.USER_PREFERENCES); // "userPreferences"
 * console.log(STORAGE_KEYS.THEME); // "theme"
 * ```
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
  USER_PREFERENCES: "userPreferences",
  THEME: "theme",
  LANGUAGE: "language",
  USER_DATA: "userData",
} as const;

/**
 * Type for storage keys derived from STORAGE_KEYS object.
 * Ensures only valid storage keys can be used.
 *
 * @example
 * ```typescript
 * // Valid usage
 * const key: StorageKey = STORAGE_KEYS.AUTH_TOKEN; // ✅
 * const key2: StorageKey = "authToken"; // ✅
 *
 * // Invalid usage - TypeScript error
 * const invalidKey: StorageKey = "invalidKey"; // ❌ Type error
 * ```
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Configuration options for storage operations.
 *
 * @property useSessionStorage - Use sessionStorage instead of localStorage (default: false)
 * @property expiryInMinutes - Auto-expire items after specified minutes (optional)
 *
 * @example
 * ```typescript
 * // Use localStorage with 30-minute expiry
 * const options: StorageOptions = {
 *   useSessionStorage: false,
 *   expiryInMinutes: 30
 * };
 *
 * // Use sessionStorage without expiry
 * const sessionOptions: StorageOptions = {
 *   useSessionStorage: true
 * };
 * ```
 */
export interface StorageOptions {
  useSessionStorage?: boolean;
  expiryInMinutes?: number;
}

/**
 * Internal interface for storage items with expiry timestamp.
 * Wraps actual values with optional expiry metadata.
 */
interface StorageItem<T> {
  value: T;
  expiry?: number;
}

/**
 * Main storage management class providing type-safe operations with expiry support.
 * Handles SSR compatibility and automatic error recovery.
 */
export class StorageManager {
  /**
   * Gets the appropriate storage instance based on options.
   * Throws error in server-side environment to prevent SSR issues.
   *
   * @param options - Storage configuration options
   * @returns Storage instance (localStorage or sessionStorage)
   * @throws Error when called in server-side environment
   *
   * @example
   * ```typescript
   * // Get localStorage (default)
   * const storage = StorageManager.getStorage(); // localStorage
   *
   * // Get sessionStorage
   * const sessionStorage = StorageManager.getStorage({ useSessionStorage: true });
   *
   * // Server-side usage (Next.js SSR)
   * if (typeof window !== 'undefined') {
   *   const storage = StorageManager.getStorage(); // Safe usage
   * }
   * ```
   */
  private static getStorage({
    useSessionStorage = false,
  }: { useSessionStorage?: boolean } = {}): Storage {
    if (typeof window === "undefined") {
      throw new Error("Storage is not available in server-side environment");
    }
    return useSessionStorage ? sessionStorage : localStorage;
  }

  /**
   * Stores an item in browser storage with optional expiry.
   * Automatically serializes complex objects to JSON.
   * Handles storage quota exceeded and other storage errors gracefully.
   *
   * @param params - Object containing key, value, and options
   * @param params.key - Storage key from STORAGE_KEYS
   * @param params.value - Value to store (any serializable type)
   * @param params.options - Storage configuration options
   *
   * @example
   * ```typescript
   * // Store authentication token (persistent)
   * StorageManager.setItem({
   *   key: STORAGE_KEYS.AUTH_TOKEN,
   *   value: "jwt-token-here",
   *   options: { expiryInMinutes: 60 } // Expires in 1 hour
   * });
   *
   * // Store user preferences (session only)
   * StorageManager.setItem({
   *   key: STORAGE_KEYS.USER_PREFERENCES,
   *   value: { theme: "dark", language: "en" },
   *   options: { useSessionStorage: true }
   * });
   *
   * // Store complex object with expiry
   * StorageManager.setItem({
   *   key: STORAGE_KEYS.USER_DATA,
   *   value: {
   *     id: 123,
   *     name: "John Doe",
   *     roles: ["admin", "user"],
   *     lastLogin: new Date().toISOString()
   *   },
   *   options: { expiryInMinutes: 1440 } // 24 hours
   * });
   *
   * // Store theme preference (permanent)
   * StorageManager.setItem({
   *   key: STORAGE_KEYS.THEME,
   *   value: "dark"
   * });
   * ```
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
   * Retrieves an item from browser storage with automatic expiry checking.
   * Returns null if item doesn't exist, is expired, or parsing fails.
   * Automatically removes expired items to keep storage clean.
   *
   * @param params - Object containing key and options
   * @param params.key - Storage key to retrieve
   * @param params.options - Storage configuration options
   * @returns Stored value or null if not found/expired
   *
   * @example
   * ```typescript
   * // Get authentication token
   * const authToken = StorageManager.getItem<string>({
   *   key: STORAGE_KEYS.AUTH_TOKEN
   * });
   * console.log(authToken); // "jwt-token-here" or null if expired
   *
   * // Get user preferences with type safety
   * const preferences = StorageManager.getItem<{theme: string, language: string}>({
   *   key: STORAGE_KEYS.USER_PREFERENCES,
   *   options: { useSessionStorage: true }
   * });
   * console.log(preferences?.theme); // "dark" or undefined
   *
   * // Get complex user data
   * interface UserData {
   *   id: number;
   *   name: string;
   *   roles: string[];
   *   lastLogin: string;
   * }
   *
   * const userData = StorageManager.getItem<UserData>({
   *   key: STORAGE_KEYS.USER_DATA
   * });
   *
   * if (userData) {
   *   console.log(`Welcome back, ${userData.name}!`);
   *   console.log(`Your roles: ${userData.roles.join(', ')}`);
   * } else {
   *   console.log("User data not found or expired");
   * }
   *
   * // Handle expired items (automatically removed)
   * const expiredItem = StorageManager.getItem<string>({
   *   key: STORAGE_KEYS.AUTH_TOKEN
   * });
   * // Returns null if token expired, and removes it from storage
   * ```
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
   * Removes a single item from browser storage.
   * Handles errors gracefully and logs failures for debugging.
   *
   * @param params - Object containing key and options
   * @param params.key - Storage key to remove
   * @param params.options - Storage configuration options
   *
   * @example
   * ```typescript
   * // Remove authentication token (logout)
   * StorageManager.removeItem({
   *   key: STORAGE_KEYS.AUTH_TOKEN
   * });
   *
   * // Remove session-specific preferences
   * StorageManager.removeItem({
   *   key: STORAGE_KEYS.USER_PREFERENCES,
   *   options: { useSessionStorage: true }
   * });
   *
   * // Usage in logout function
   * const handleLogout = () => {
   *   StorageManager.removeItem({ key: STORAGE_KEYS.AUTH_TOKEN });
   *   StorageManager.removeItem({ key: STORAGE_KEYS.REFRESH_TOKEN });
   *   StorageManager.removeItem({ key: STORAGE_KEYS.USER_DATA });
   *   // Redirect to login
   * };
   * ```
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
   * Removes multiple items from storage in a single operation.
   * Useful for cleanup operations like logout or reset functionality.
   *
   * @param params - Object containing keys array and options
   * @param params.keys - Array of storage keys to remove
   * @param params.options - Storage configuration options
   *
   * @example
   * ```typescript
   * // Clear all authentication-related data
   * StorageManager.removeItems({
   *   keys: [
   *     STORAGE_KEYS.AUTH_TOKEN,
   *     STORAGE_KEYS.REFRESH_TOKEN,
   *     STORAGE_KEYS.USER_DATA
   *   ]
   * });
   *
   * // Clear session preferences
   * StorageManager.removeItems({
   *   keys: [
   *     STORAGE_KEYS.USER_PREFERENCES,
   *     STORAGE_KEYS.THEME
   *   ],
   *   options: { useSessionStorage: true }
   * });
   *
   * // Usage in app reset
   * const resetApp = () => {
   *   StorageManager.removeItems({
   *     keys: Object.values(STORAGE_KEYS) as StorageKey[]
   *   });
   *   window.location.reload();
   * };
   * ```
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
   * Removes all storage items that start with a specific prefix.
   * Useful for clearing feature-specific or namespaced data.
   *
   * @param params - Object containing prefix and options
   * @param params.prefix - String prefix to match storage keys
   * @param params.options - Storage configuration options
   *
   * @example
   * ```typescript
   * // Clear all cache entries (assuming they start with "cache_")
   * StorageManager.clearByPrefix({
   *   prefix: "cache_"
   * });
   *
   * // Clear all device-specific settings
   * StorageManager.clearByPrefix({
   *   prefix: "device_settings_"
   * });
   *
   * // Clear temporary session data
   * StorageManager.clearByPrefix({
   *   prefix: "temp_",
   *   options: { useSessionStorage: true }
   * });
   *
   * // Usage in feature cleanup
   * const clearFeatureData = (featureName: string) => {
   *   StorageManager.clearByPrefix({
   *     prefix: `${featureName}_`
   *   });
   * };
   *
   * clearFeatureData("reports"); // Clears "reports_filter", "reports_settings", etc.
   * ```
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
   * Checks if an item exists in storage and is not expired.
   * More efficient than getting the item when you only need existence check.
   *
   * @param params - Object containing key and options
   * @param params.key - Storage key to check
   * @param params.options - Storage configuration options
   * @returns True if item exists and is valid, false otherwise
   *
   * @example
   * ```typescript
   * // Check if user is authenticated
   * const isAuthenticated = StorageManager.hasItem({
   *   key: STORAGE_KEYS.AUTH_TOKEN
   * });
   *
   * if (isAuthenticated) {
   *   console.log("User is logged in");
   * } else {
   *   console.log("User needs to log in");
   * }
   *
   * // Check theme preference before applying default
   * const hasThemePreference = StorageManager.hasItem({
   *   key: STORAGE_KEYS.THEME
   * });
   *
   * const theme = hasThemePreference
   *   ? StorageManager.getItem<string>({ key: STORAGE_KEYS.THEME })
   *   : "light"; // default theme
   *
   * // Conditional rendering based on storage
   * const ShowUserProfile = () => {
   *   const hasUserData = StorageManager.hasItem({
   *     key: STORAGE_KEYS.USER_DATA
   *   });
   *
   *   return hasUserData ? <UserProfile /> : <LoginPrompt />;
   * };
   * ```
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
   * Retrieves all storage keys from the specified storage type.
   * Useful for debugging, analytics, or bulk operations.
   *
   * @param params - Object containing options
   * @param params.options - Storage configuration options
   * @returns Array of all storage keys
   *
   * @example
   * ```typescript
   * // Get all localStorage keys
   * const localKeys = StorageManager.getAllKeys();
   * console.log("LocalStorage keys:", localKeys);
   * // Output: ["authToken", "userPreferences", "theme", "language"]
   *
   * // Get all sessionStorage keys
   * const sessionKeys = StorageManager.getAllKeys({
   *   options: { useSessionStorage: true }
   * });
   * console.log("SessionStorage keys:", sessionKeys);
   *
   * // Debug storage usage
   * const debugStorage = () => {
   *   const keys = StorageManager.getAllKeys();
   *   console.log(`Found ${keys.length} items in localStorage:`);
   *
   *   keys.forEach(key => {
   *     const item = localStorage.getItem(key);
   *     console.log(`${key}: ${item?.length} characters`);
   *   });
   * };
   *
   * // Check for app-specific keys
   * const appKeys = StorageManager.getAllKeys().filter(key =>
   *   Object.values(STORAGE_KEYS).includes(key as StorageKey)
   * );
   * console.log("App-managed keys:", appKeys);
   * ```
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
   * Clears all items from the specified storage type.
   * Use with caution as this removes ALL storage data.
   *
   * @param params - Object containing options
   * @param params.options - Storage configuration options
   *
   * @example
   * ```typescript
   * // Clear all localStorage (nuclear option)
   * StorageManager.clearAll();
   *
   * // Clear only sessionStorage
   * StorageManager.clearAll({
   *   options: { useSessionStorage: true }
   * });
   *
   * // Usage in app reset with confirmation
   * const resetApplication = () => {
   *   const confirmed = window.confirm(
   *     "This will clear all saved data. Are you sure?"
   *   );
   *
   *   if (confirmed) {
   *     StorageManager.clearAll();
   *     StorageManager.clearAll({ options: { useSessionStorage: true } });
   *     window.location.reload();
   *   }
   * };
   *
   * // Development/testing utility
   * const clearTestData = () => {
   *   if (process.env.NODE_ENV === 'development') {
   *     StorageManager.clearAll();
   *     console.log("Test data cleared");
   *   }
   * };
   * ```
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

/**
 * Convenience functions for common storage operations.
 * Provides domain-specific methods for frequently used storage patterns.
 *
 * @example
 * ```typescript
 * // Using convenience functions instead of StorageManager directly
 *
 * // Set user preferences
 * storage.setUserPreferences({
 *   preferences: {
 *     notifications: true,
 *     autoSave: false,
 *     dashboardLayout: "grid"
 *   }
 * });
 *
 * // Get user preferences
 * const prefs = storage.getUserPreferences();
 * console.log(prefs?.notifications); // true
 *
 * // Theme management
 * storage.setTheme({ theme: "dark" });
 * const currentTheme = storage.getTheme(); // "dark"
 *
 * // Language management
 * storage.setLanguage({ language: "es" });
 * const currentLanguage = storage.getLanguage(); // "es"
 * ```
 */
export const storage = {
  /**
   * Stores user preferences with automatic serialization.
   *
   * @param params - Object containing preferences and options
   * @param params.preferences - User preferences object
   * @param params.options - Storage configuration options
   *
   * @example
   * ```typescript
   * // Store dashboard preferences
   * storage.setUserPreferences({
   *   preferences: {
   *     theme: "dark",
   *     language: "en",
   *     notifications: {
   *       email: true,
   *       push: false,
   *       sound: true
   *     },
   *     dashboard: {
   *       layout: "grid",
   *       refreshInterval: 30,
   *       defaultView: "summary"
   *     }
   *   }
   * });
   *
   * // Store with expiry (session-like behavior)
   * storage.setUserPreferences({
   *   preferences: { temporarySetting: "value" },
   *   options: { expiryInMinutes: 60 }
   * });
   * ```
   */
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

  /**
   * Retrieves user preferences with type safety.
   *
   * @param params - Object containing options
   * @param params.options - Storage configuration options
   * @returns User preferences object or null if not found
   *
   * @example
   * ```typescript
   * // Get all preferences
   * const prefs = storage.getUserPreferences();
   *
   * if (prefs) {
   *   console.log("Theme:", prefs.theme);
   *   console.log("Language:", prefs.language);
   *   console.log("Notifications enabled:", prefs.notifications?.email);
   * }
   *
   * // With default fallback
   * const preferences = storage.getUserPreferences() ?? {
   *   theme: "light",
   *   language: "en",
   *   notifications: { email: true, push: true }
   * };
   *
   * // Type-safe access with interface
   * interface UserPreferences {
   *   theme: "light" | "dark";
   *   language: string;
   *   notifications: {
   *     email: boolean;
   *     push: boolean;
   *   };
   * }
   *
   * const typedPrefs = storage.getUserPreferences() as UserPreferences | null;
   * ```
   */
  getUserPreferences: ({
    options,
  }: {
    options?: StorageOptions;
  } = {}): Record<string, unknown> | null =>
    StorageManager.getItem<Record<string, unknown>>({
      key: STORAGE_KEYS.USER_PREFERENCES,
      options,
    }),

  /**
   * Stores theme preference for consistent UI theming.
   *
   * @param params - Object containing theme and options
   * @param params.theme - Theme identifier string
   * @param params.options - Storage configuration options
   *
   * @example
   * ```typescript
   * // Set dark theme
   * storage.setTheme({ theme: "dark" });
   *
   * // Set custom theme with expiry
   * storage.setTheme({
   *   theme: "custom-blue",
   *   options: { expiryInMinutes: 1440 } // 24 hours
   * });
   *
   * // Usage in theme toggle
   * const toggleTheme = () => {
   *   const current = storage.getTheme();
   *   const newTheme = current === "dark" ? "light" : "dark";
   *   storage.setTheme({ theme: newTheme });
   *   document.documentElement.setAttribute("data-theme", newTheme);
   * };
   * ```
   */
  setTheme: ({ theme, options }: { theme: string; options?: StorageOptions }) =>
    StorageManager.setItem({ key: STORAGE_KEYS.THEME, value: theme, options }),

  /**
   * Retrieves current theme preference.
   *
   * @param params - Object containing options
   * @param params.options - Storage configuration options
   * @returns Theme string or null if not set
   *
   * @example
   * ```typescript
   * // Get current theme
   * const theme = storage.getTheme();
   * console.log("Current theme:", theme); // "dark" or null
   *
   * // Apply theme with fallback
   * const currentTheme = storage.getTheme() ?? "light";
   * document.documentElement.setAttribute("data-theme", currentTheme);
   *
   * // Conditional styling
   * const isDarkMode = storage.getTheme() === "dark";
   * const buttonClass = isDarkMode ? "btn-dark" : "btn-light";
   * ```
   */
  getTheme: ({ options }: { options?: StorageOptions } = {}): string | null =>
    StorageManager.getItem<string>({ key: STORAGE_KEYS.THEME, options }),

  /**
   * Stores language preference for internationalization.
   *
   * @param params - Object containing language and options
   * @param params.language - Language code (e.g., "en", "es", "fr")
   * @param params.options - Storage configuration options
   *
   * @example
   * ```typescript
   * // Set Spanish language
   * storage.setLanguage({ language: "es" });
   *
   * // Set language with session storage
   * storage.setLanguage({
   *   language: "fr",
   *   options: { useSessionStorage: true }
   * });
   *
   * // Usage in language selector
   * const handleLanguageChange = (langCode: string) => {
   *   storage.setLanguage({ language: langCode });
   *   i18n.changeLanguage(langCode);
   *   window.location.reload(); // Refresh to apply new language
   * };
   * ```
   */
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

  /**
   * Retrieves current language preference.
   *
   * @param params - Object containing options
   * @param params.options - Storage configuration options
   * @returns Language code or null if not set
   *
   * @example
   * ```typescript
   * // Get current language
   * const language = storage.getLanguage();
   * console.log("Current language:", language); // "en" or null
   *
   * // Initialize i18n with stored language
   * const savedLanguage = storage.getLanguage() ?? "en";
   * i18n.init({
   *   lng: savedLanguage,
   *   fallbackLng: "en"
   * });
   *
   * // Conditional content rendering
   * const isSpanish = storage.getLanguage() === "es";
   * const greeting = isSpanish ? "Hola" : "Hello";
   * ```
   */
  getLanguage: ({ options }: { options?: StorageOptions } = {}):
    | string
    | null =>
    StorageManager.getItem<string>({ key: STORAGE_KEYS.LANGUAGE, options }),
};
