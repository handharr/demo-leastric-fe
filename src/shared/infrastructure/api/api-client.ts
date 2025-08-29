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
import { Logger } from "@/shared/utils/logger/logger";

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
    const baseURL =
      config.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
    this.config = {
      baseURL,
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
      refreshTokenEndpoint: config.refreshTokenEndpoint || "/v1/refresh",
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

        Logger.error("ApiClient", "API Response Error:", error);

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
              Logger.info("ApiClient", "Token refreshed successfully");
              // Update the original request with new token
              const newToken = this.getAuthToken();
              if (newToken && originalRequest.headers) {
                Logger.info(
                  "ApiClient",
                  "Setting Authorization header with new token"
                );
                originalRequest.headers.Authorization = newToken;
              }

              // Retry the original request
              Logger.info("ApiClient", "Retrying original request");
              return this.axiosInstance(originalRequest);
            } else {
              Logger.warn("ApiClient", "Token refresh failed");
              // Token refresh failed, handle auth failure
              await this.handleAuthFailure();
            }
          } catch (refreshError) {
            Logger.error("ApiClient", "Token refresh failed:", refreshError);
            await this.handleAuthFailure();
          }
        }

        // Handle 403 errors (forbidden) - might indicate invalid/expired refresh token
        if (
          error.response?.status === 403 &&
          !originalRequest._authFailureHandled
        ) {
          Logger.warn("ApiClient", "Handling 403 Forbidden error");
          originalRequest._authFailureHandled = true;
          await this.handleAuthFailure();
        }

        Logger.error("ApiClient", "API Request Error:", error);
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
      Logger.warn("ApiClient", "Token refresh is disabled");
      return;
    }

    // Set up the default token refresh handler
    Logger.info("ApiClient", "Setting up default token refresh handler");
    this.customTokenRefreshHandler = this.createDefaultTokenRefreshHandler();
  }

  /**
   * Create default token refresh handler
   */
  private createDefaultTokenRefreshHandler(): TokenRefreshHandler {
    return {
      refreshToken: async (token: string) => {
        try {
          Logger.info("ApiClient", "Attempting token refresh...");

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
            Logger.info("ApiClient", "Token refresh successful");
            return { success: true, token: response.data.token };
          }

          Logger.warn(
            "ApiClient",
            "Token refresh API returned failure:",
            response.data.message
          );
          return { success: false };
        } catch (error) {
          Logger.error("ApiClient", "Token refresh API call failed:", error);
          return { success: false };
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onRefreshSuccess: (newToken: string) => {
        Logger.info("ApiClient", "Token refreshed successfully:", newToken);
        this.setAuthToken(newToken);
      },
      onRefreshFailure: (error: unknown) => {
        Logger.error("ApiClient", "Token refresh failed:", error);
      },
    };
  }

  /**
   * Set custom token refresh handler (overrides default)
   */
  setTokenRefreshHandler(handler: TokenRefreshHandler): void {
    Logger.info("ApiClient", "Setting custom token refresh handler");
    this.customTokenRefreshHandler = handler;
  }

  /**
   * Handle authentication failure - clear tokens and trigger logout
   */
  private async handleAuthFailure(): Promise<void> {
    Logger.warn(
      "ApiClient",
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
      Logger.info("ApiClient", "Calling auth failure callback");
      this.config.onAuthFailure();
    } catch (error) {
      Logger.error("ApiClient", "Error during auth failure handling:", error);
    }
  }

  /**
   * Default auth failure handler
   */
  private defaultAuthFailureHandler(): void {
    Logger.info("ApiClient", "Default auth failure handler - tokens cleared");
    return;

    if (typeof window !== "undefined") {
      // Emit an event that components can listen to
      Logger.info("ApiClient", "Emitting auth failure event");
      window.dispatchEvent(
        new CustomEvent("auth:failure", {
          detail: { reason: "authentication_failed" },
        })
      );
      // Redirect to /login
      Logger.info("ApiClient", "Redirecting to /login");
      window.location.href = "/login";
    }
  }

  /**
   * Set auth failure handler
   */
  setAuthFailureHandler(handler: () => void): void {
    Logger.info("ApiClient", "Setting custom auth failure handler");
    this.config.onAuthFailure = handler;
  }

  /**
   * Handle token refresh with max attempts
   */
  private async handleTokenRefresh(): Promise<boolean> {
    Logger.info(
      "ApiClient",
      "Handling token refresh:",
      this.currentRefreshAttempts
    );
    if (!this.customTokenRefreshHandler) {
      Logger.warn("ApiClient", "No token refresh handler available");
      return false;
    }

    // Check if we've exceeded max refresh attempts
    if (this.currentRefreshAttempts >= this.maxRefreshAttempts) {
      Logger.warn("ApiClient", "Max token refresh attempts exceeded");
      return false;
    }

    // Prevent multiple refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      Logger.info("ApiClient", "Waiting for ongoing token refresh");
      return this.refreshPromise;
    }

    Logger.info("ApiClient", "Starting token refresh");
    this.isRefreshing = true;
    this.currentRefreshAttempts++;
    this.refreshPromise = this.performTokenRefresh();

    try {
      Logger.info("ApiClient", "Waiting for token refresh to complete");
      const result = await this.refreshPromise;
      Logger.info("ApiClient", "Token refresh result:", result);
      if (result) {
        // Reset attempts on successful refresh
        Logger.info("ApiClient", "Token refresh successful");
        this.currentRefreshAttempts = 0;
      }

      Logger.info("ApiClient", "Token refresh completed");
      return result;
    } finally {
      Logger.info("ApiClient", "Token refresh attempt finished");
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    if (!this.customTokenRefreshHandler) {
      Logger.warn("ApiClient", "No token refresh handler available");
      return false;
    }

    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        Logger.warn("ApiClient", "No refresh token available");
        return false;
      }

      Logger.info("ApiClient", "Attempting token refresh with:", refreshToken);

      const result = await this.customTokenRefreshHandler.refreshToken(
        refreshToken
      );

      Logger.info("ApiClient", "Token refresh result:", result);

      if (result.success && result.token) {
        this.setAuthToken(result.token);
        this.customTokenRefreshHandler.onRefreshSuccess?.(result.token);
        Logger.info("ApiClient", "Token refresh successful", result.token);
        return true;
      } else {
        Logger.warn("ApiClient", "Token refresh returned failure");
        this.customTokenRefreshHandler.onRefreshFailure?.(
          new Error("Token refresh failed")
        );
        return false;
      }
    } catch (error) {
      Logger.error("ApiClient", "Token refresh error:", error);
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
    Logger.info("ApiClient", "Executing API call with retry");
    if (!this.config.enableRetry) {
      Logger.info(
        "ApiClient",
        "Retry is disabled, executing API call without retry"
      );
      const response = await apiCall();
      return response.data;
    }

    const options: RetryOptions = {
      ...this.config.retryOptions,
      ...retryOptions,
      retryCondition: (error: unknown) => {
        Logger.info("ApiClient", "Checking retry condition");
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;

          // Don't retry 4xx client errors (except 408, 429)
          // Don't retry 401 (handled by token refresh)
          if (status && status >= 400 && status < 500) {
            Logger.info("ApiClient", "Not retrying 4xx error:", status);
            return status === 408 || status === 429;
          }

          Logger.info("ApiClient", "Not retrying 5xx error:", status);
          // Retry 5xx server errors and network errors
          return !status || status >= 500;
        }
        return true; // Retry network errors
      },
      onRetry: (attempt, error) => {
        Logger.info("ApiClient", `API retry attempt ${attempt}:`, error);
        retryOptions?.onRetry?.(attempt, error);
      },
    };

    const result = await RetryHandler.withRetry(async () => {
      Logger.info("ApiClient", "Executing API call");
      const response = await apiCall();
      Logger.info("ApiClient", "API call executed successfully");
      return response.data;
    }, options);

    if (result.success && result.data !== undefined) {
      Logger.info("ApiClient", "API call result:", result.data);
      return result.data;
    } else {
      Logger.error("ApiClient", "API call failed:", result.error);
      throw result.error;
    }
  }

  /**
   * Token management methods
   */
  private getAuthToken(): string {
    Logger.info("ApiClient", "Getting auth token");
    if (typeof window === "undefined") return "";
    const token = storage.getAuthToken();
    Logger.info("ApiClient", "Auth token retrieved:", token);
    return token ? `Bearer ${token}` : "";
  }

  private getRefreshToken(): string | null {
    Logger.info("ApiClient", "Getting refresh token");
    if (typeof window === "undefined") return null;
    const token = storage.getRefreshToken();
    Logger.info("ApiClient", "Refresh token retrieved:", token);
    return token;
  }

  private setAuthToken(token: string): void {
    Logger.info("ApiClient", "Setting auth token:", token);
    if (typeof window !== "undefined") {
      Logger.info("ApiClient", "Storing auth token");
      storage.setAuthToken({ token });
    }
  }

  private clearTokens(): void {
    Logger.info("ApiClient", "Clearing tokens");
    if (typeof window !== "undefined") {
      Logger.info("ApiClient", "Removing auth token");
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
    Logger.error("ApiClient", "API Error:", error);

    // Handle network errors
    if (!error.response) {
      Logger.error("ApiClient", "Network error:", error);
      return {
        statusCode: 501,
        method: error.request?.method,
        path: error.request?.url,
        meta: {
          message: "Network error. Please check your connection.",
          error: "NETWORK_ERROR",
          statusCode: 501,
        },
      };
    }

    Logger.error("ApiClient", "HTTP error:", error);
    // Handle HTTP errors with response data
    const responseData = error.response.data;
    const statusCode = error.response.status;

    return {
      statusCode,
      meta: {
        message: responseData?.meta?.message || defaultMessage,
        error: responseData?.meta?.error || "API_ERROR",
        statusCode,
      },
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
