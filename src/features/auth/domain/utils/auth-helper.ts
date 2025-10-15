import { UserModel } from "@/shared/domain/entities/user-model";
import {
  StorageManager,
  STORAGE_KEYS,
} from "@/core/utils/helpers/storage-helper";

/**
 * Authentication helper utilities
 */

export interface LogoutOptions {
  /**
   * Whether to clear session storage as well
   */
  clearSessionStorage?: boolean;
  /**
   * Whether to redirect after logout (useful for client-side routing)
   */
  redirect?: boolean;
  /**
   * Custom redirect URL
   */
  redirectUrl?: string;
  /**
   * Whether to call logout API endpoint
   */
  callLogoutApi?: boolean;
}

export class AuthHelper {
  /**
   * Logout user and clear all authentication data
   */
  static logout(options: LogoutOptions = {}): void {
    const {
      clearSessionStorage = true,
      redirect = false,
      redirectUrl = "/login",
      callLogoutApi = false,
    } = options;

    try {
      // Clear auth tokens from localStorage
      AuthHelper.clearAllUserData();

      // Clear user data
      StorageManager.removeItem({ key: STORAGE_KEYS.USER_DATA });

      // Clear session storage if requested
      if (clearSessionStorage) {
        AuthHelper.clearAllUserData();
        StorageManager.removeItem({
          key: STORAGE_KEYS.USER_DATA,
          options: { useSessionStorage: true },
        });
      }

      // Call logout API if requested
      if (callLogoutApi) {
        this.callLogoutEndpoint();
      }

      // Redirect if requested and we're in browser environment
      if (redirect && typeof window !== "undefined") {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  /**
   * Clear all user-related data (more comprehensive than just auth data)
   */
  static clearAllUserData(
    options: { clearSessionStorage?: boolean } = {}
  ): void {
    const { clearSessionStorage = true } = options;

    try {
      // Clear from localStorage
      const keysToRemove = [
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_PREFERENCES,
      ];

      StorageManager.removeItems({ keys: keysToRemove });

      // Clear from sessionStorage if requested
      if (clearSessionStorage) {
        StorageManager.removeItems({
          keys: keysToRemove,
          options: { useSessionStorage: true },
        });
      }
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const authToken = AuthHelper.getAuthToken();
    return authToken !== null;
  }

  /**
   * Get current user's auth token
   */
  static getAuthToken(): string | null {
    return StorageManager.getItem<string>({ key: STORAGE_KEYS.AUTH_TOKEN });
  }

  /**
   * Get current user's refresh token
   */
  static getRefreshToken(): string | null {
    return StorageManager.getItem<string>({
      key: STORAGE_KEYS.REFRESH_TOKEN,
    });
  }

  /**
   * Set authentication tokens
   */
  static setAuthTokens({
    authToken,
    refreshToken,
    expiryInMinutes,
    useSessionStorage = false,
  }: {
    authToken: string;
    refreshToken?: string;
    expiryInMinutes?: number;
    useSessionStorage?: boolean;
  }): void {
    const options = { useSessionStorage, expiryInMinutes };

    StorageManager.setItem({
      key: STORAGE_KEYS.AUTH_TOKEN,
      value: authToken,
      options,
    });

    if (refreshToken) {
      StorageManager.setItem({
        key: STORAGE_KEYS.REFRESH_TOKEN,
        value: refreshToken,
        options,
      });
    }
  }

  /**
   * Force logout - clears everything and redirects immediately
   */
  static forceLogout(redirectUrl: string = "/login"): void {
    this.logout({
      clearSessionStorage: true,
      redirect: true,
      redirectUrl,
      callLogoutApi: true,
    });
  }

  /**
   * Silent logout - clears data without redirect (useful for token expiry)
   */
  static silentLogout(): void {
    this.logout({
      clearSessionStorage: true,
      redirect: false,
      callLogoutApi: false,
    });
  }

  /**
   * Call logout API endpoint (implement based on your API structure)
   */
  private static async callLogoutEndpoint(): Promise<void> {
    try {
      // This is a placeholder - implement based on your API structure
      const authToken = this.getAuthToken();

      if (authToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Error calling logout API:", error);
      // Don't throw error as logout should proceed even if API call fails
    }
  }

  /**
   * Check if refresh token exists and is valid
   */
  static hasValidRefreshToken(): boolean {
    const refreshToken = AuthHelper.getRefreshToken();
    return refreshToken !== null;
  }

  /**
   * Get user data from storage
   */
  static getUserData(): UserModel | null {
    return StorageManager.getItem<UserModel>({ key: STORAGE_KEYS.USER_DATA });
  }

  /**
   * Set user data in storage
   */
  static setUserData({
    userData,
    useSessionStorage = false,
    expiryInMinutes,
  }: {
    userData: UserModel;
    useSessionStorage?: boolean;
    expiryInMinutes?: number;
  }): void {
    StorageManager.setItem({
      key: STORAGE_KEYS.USER_DATA,
      value: userData,
      options: { useSessionStorage, expiryInMinutes },
    });
  }
}
