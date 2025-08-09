import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { storage } from "@/shared/utils/helpers/storage-helper";
import {
  RetryHandler,
  RetryOptions,
} from "@/shared/utils/helpers/retry-helper";

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  enableRetry?: boolean;
  enableTokenRefresh?: boolean;
  retryOptions?: RetryOptions;
  onAuthFailure?: () => void;
  refreshTokenEndpoint?: string; // Allow custom refresh endpoint
}

export interface TokenRefreshHandler {
  refreshToken: (
    token: string
  ) => Promise<{ success: boolean; token?: string }>;
  onRefreshSuccess?: (newToken: string) => void;
  onRefreshFailure?: (error: unknown) => void;
}

// Default refresh token response interface
interface DefaultRefreshTokenResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private customTokenRefreshHandler: TokenRefreshHandler | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private config: Required<ApiClientConfig>;
  private maxRefreshAttempts = 1;
  private currentRefreshAttempts = 0;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL:
        config.baseURL ||
        process.env.PUBLIC_API_BASE_URL ||
        "http://localhost:3000/api",
      timeout: config.timeout || 10000,
      enableRetry: config.enableRetry ?? true,
      enableTokenRefresh: config.enableTokenRefresh ?? true,
      retryOptions: config.retryOptions || {
        maxRetries: 2,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      },
      onAuthFailure: config.onAuthFailure || this.defaultAuthFailureHandler,
      refreshTokenEndpoint: config.refreshTokenEndpoint || "/auth/refresh",
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
    this.initializeTokenRefreshHandler();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAuthToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh and auth failures
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
          _authFailureHandled?: boolean;
        };

        // Handle 401 errors with automatic token refresh
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.config.enableTokenRefresh
        ) {
          originalRequest._retry = true;

          try {
            const refreshSuccess = await this.handleTokenRefresh();

            if (refreshSuccess) {
              // Update the original request with new token
              const newToken = this.getAuthToken();
              if (newToken && originalRequest.headers) {
                originalRequest.headers.Authorization = newToken;
              }

              // Retry the original request
              return this.axiosInstance(originalRequest);
            } else {
              // Token refresh failed, handle auth failure
              await this.handleAuthFailure();
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            await this.handleAuthFailure();
          }
        }

        // Handle 403 errors (forbidden) - might indicate invalid/expired refresh token
        if (
          error.response?.status === 403 &&
          !originalRequest._authFailureHandled
        ) {
          originalRequest._authFailureHandled = true;
          await this.handleAuthFailure();
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize default token refresh handler that calls the API
   */
  private initializeTokenRefreshHandler(): void {
    // Only setup if token refresh is enabled and no custom handler is set
    if (!this.config.enableTokenRefresh) {
      return;
    }

    // Set up the default token refresh handler
    this.customTokenRefreshHandler = this.createDefaultTokenRefreshHandler();
  }

  /**
   * Create default token refresh handler
   */
  private createDefaultTokenRefreshHandler(): TokenRefreshHandler {
    return {
      refreshToken: async (token: string) => {
        try {
          console.log("Attempting token refresh...");

          // Use axios instance directly to avoid interceptors for refresh call
          const response = await axios.post<DefaultRefreshTokenResponse>(
            `${this.config.baseURL}${this.config.refreshTokenEndpoint}`,
            { token },
            {
              timeout: this.config.timeout,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success && response.data.token) {
            return { success: true, token: response.data.token };
          }

          console.warn(
            "Token refresh API returned failure:",
            response.data.message
          );
          return { success: false };
        } catch (error) {
          console.error("Token refresh API call failed:", error);
          return { success: false };
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onRefreshSuccess: (newToken: string) => {
        console.log("Token refreshed successfully");
      },
      onRefreshFailure: (error: unknown) => {
        console.error("Token refresh failed, will trigger logout:", error);
      },
    };
  }

  /**
   * Set custom token refresh handler (overrides default)
   */
  setTokenRefreshHandler(handler: TokenRefreshHandler): void {
    this.customTokenRefreshHandler = handler;
  }

  /**
   * Handle authentication failure - clear tokens and trigger logout
   */
  private async handleAuthFailure(): Promise<void> {
    console.warn(
      "Authentication failed, clearing tokens and redirecting to login"
    );

    // Clear all tokens
    this.clearTokens();

    // Reset refresh attempts
    this.currentRefreshAttempts = 0;
    this.isRefreshing = false;
    this.refreshPromise = null;

    // Call the auth failure callback (logout/redirect)
    try {
      this.config.onAuthFailure();
    } catch (error) {
      console.error("Error during auth failure handling:", error);
    }
  }

  /**
   * Default auth failure handler
   */
  private defaultAuthFailureHandler(): void {
    console.log("Default auth failure handler - tokens cleared");

    if (typeof window !== "undefined") {
      // Emit an event that components can listen to
      window.dispatchEvent(
        new CustomEvent("auth:failure", {
          detail: { reason: "authentication_failed" },
        })
      );
    }
  }

  /**
   * Set auth failure handler
   */
  setAuthFailureHandler(handler: () => void): void {
    this.config.onAuthFailure = handler;
  }

  /**
   * Handle token refresh with max attempts
   */
  private async handleTokenRefresh(): Promise<boolean> {
    if (!this.customTokenRefreshHandler) {
      console.warn("No token refresh handler available");
      return false;
    }

    // Check if we've exceeded max refresh attempts
    if (this.currentRefreshAttempts >= this.maxRefreshAttempts) {
      console.warn("Max token refresh attempts exceeded");
      return false;
    }

    // Prevent multiple refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.currentRefreshAttempts++;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;

      if (result) {
        // Reset attempts on successful refresh
        this.currentRefreshAttempts = 0;
      }

      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    if (!this.customTokenRefreshHandler) {
      return false;
    }

    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.warn("No refresh token available");
        return false;
      }

      const result = await this.customTokenRefreshHandler.refreshToken(
        refreshToken
      );

      if (result.success && result.token) {
        this.setAuthToken(result.token);
        this.customTokenRefreshHandler.onRefreshSuccess?.(result.token);
        console.log("Token refresh successful");
        return true;
      } else {
        console.warn("Token refresh returned failure");
        this.customTokenRefreshHandler.onRefreshFailure?.(
          new Error("Token refresh failed")
        );
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      this.customTokenRefreshHandler.onRefreshFailure?.(error);
      return false;
    }
  }

  /**
   * Execute API call with retry logic
   */
  async executeWithRetry<T>(
    apiCall: () => Promise<AxiosResponse<T>>,
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    if (!this.config.enableRetry) {
      const response = await apiCall();
      return response.data;
    }

    const options: RetryOptions = {
      ...this.config.retryOptions,
      ...retryOptions,
      retryCondition: (error: unknown) => {
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;

          // Don't retry 4xx client errors (except 408, 429)
          // Don't retry 401 (handled by token refresh)
          if (status && status >= 400 && status < 500) {
            return status === 408 || status === 429;
          }

          // Retry 5xx server errors and network errors
          return !status || status >= 500;
        }
        return true; // Retry network errors
      },
      onRetry: (attempt, error) => {
        console.log(`API retry attempt ${attempt}:`, error);
        retryOptions?.onRetry?.(attempt, error);
      },
    };

    const result = await RetryHandler.withRetry(async () => {
      const response = await apiCall();
      return response.data;
    }, options);

    if (result.success && result.data !== undefined) {
      return result.data;
    } else {
      throw result.error;
    }
  }

  /**
   * Token management methods
   */
  private getAuthToken(): string {
    if (typeof window === "undefined") return "";
    const token = storage.getAuthToken();
    return token ? `Bearer ${token}` : "";
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return storage.getRefreshToken();
  }

  private setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      storage.setAuthToken({ token });
    }
  }

  private clearTokens(): void {
    if (typeof window !== "undefined") {
      storage.clearAuthData();
      storage.clearAuthData({ options: { useSessionStorage: true } });
    }
  }

  /**
   * HTTP Methods
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.axiosInstance.get<T>(url, config));
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.post<T>(url, data, config)
    );
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.put<T>(url, data, config)
    );
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.patch<T>(url, data, config)
    );
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() =>
      this.axiosInstance.delete<T>(url, config)
    );
  }

  /**
   * Direct axios instance access for special cases (like refresh token)
   */
  get instance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Handle error responses consistently
   */
  handleError(
    error: AxiosError<BaseErrorResponse>,
    defaultMessage: string
  ): BaseErrorResponse {
    console.error("API Error:", error);

    // Handle network errors
    if (!error.response) {
      return {
        message: "Network error. Please check your connection.",
        error: "NETWORK_ERROR",
        details: error.message,
        statusCode: 0,
      };
    }

    // Handle HTTP errors with response data
    const responseData = error.response.data;
    const statusCode = error.response.status;

    return {
      message: responseData?.message || defaultMessage,
      error: responseData?.error || "API_ERROR",
      details: responseData?.details || error.message,
      statusCode,
    };
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Auth-specific API client factory
export function createAuthApiClient(
  config?: Partial<ApiClientConfig>
): ApiClient {
  return new ApiClient({
    enableTokenRefresh: true,
    enableRetry: true,
    retryOptions: {
      maxRetries: 2,
      onRetry: (attempt, error) => {
        console.log(`Auth API retry attempt ${attempt}:`, error);
      },
    },
    ...config,
  });
}
