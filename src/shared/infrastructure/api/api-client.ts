import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import {
  RetryHandler,
  RetryOptions,
} from "@/shared/utils/helpers/retry-helper";
import { Logger } from "@/shared/utils/logger/logger";
import { BaseResponse } from "@/shared/infrastructure/models/base-response";
import { AuthHelper } from "@/features/auth/domain/utils/auth-helper";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

/**
 * Configuration options for the ApiClient.
 * Provides comprehensive control over HTTP behavior, authentication, and retry logic.
 *
 * @property baseURL - Base URL for all API requests (defaults to NEXT_PUBLIC_API_BASE_URL)
 * @property timeout - Request timeout in milliseconds (default: 10000ms)
 * @property enableRetry - Enable automatic retry logic with exponential backoff (default: true)
 * @property enableTokenRefresh - Enable automatic token refresh on 401 errors (default: true)
 * @property retryOptions - Configuration for retry behavior
 * @property onAuthFailure - Callback function called when authentication fails
 * @property refreshTokenEndpoint - API endpoint for token refresh (default: "/v1/refresh")
 * @property disableCache - Add cache-control headers to prevent caching (default: false)
 *
 * @example
 * ```typescript
 * // Basic configuration
 * const basicConfig: ApiClientConfig = {
 *   baseURL: "https://api.leastric.com",
 *   timeout: 15000
 * };
 *
 * // Advanced configuration with custom retry and auth handling
 * const advancedConfig: ApiClientConfig = {
 *   baseURL: "https://api.leastric.com",
 *   timeout: 30000,
 *   enableRetry: true,
 *   enableTokenRefresh: true,
 *   retryOptions: {
 *     maxRetries: 3,
 *     initialDelay: 2000,
 *     backoffFactor: 1.5
 *   },
 *   onAuthFailure: () => {
 *     console.log("Authentication failed, redirecting to login");
 *     window.location.href = "/login";
 *   },
 *   refreshTokenEndpoint: "/auth/refresh",
 *   disableCache: true
 * };
 *
 * // Development configuration
 * const devConfig: ApiClientConfig = {
 *   baseURL: "http://localhost:3001",
 *   timeout: 5000,
 *   enableRetry: false, // Disable retry for faster debugging
 *   disableCache: true
 * };
 * ```
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  enableRetry?: boolean;
  enableTokenRefresh?: boolean;
  retryOptions?: RetryOptions;
  onAuthFailure?: () => void;
  refreshTokenEndpoint?: string;
  disableCache?: boolean;
}

/**
 * Interface for custom token refresh handlers.
 * Allows customization of token refresh logic for different authentication systems.
 *
 * @property refreshToken - Function that performs the token refresh operation
 * @property onRefreshSuccess - Optional callback called when refresh succeeds
 * @property onRefreshFailure - Optional callback called when refresh fails
 *
 * @example
 * ```typescript
 * // Custom token refresh handler for OAuth2
 * const oauthRefreshHandler: TokenRefreshHandler = {
 *   refreshToken: async (token: string) => {
 *     try {
 *       const response = await fetch('/oauth/token', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
 *         body: new URLSearchParams({
 *           grant_type: 'refresh_token',
 *           refresh_token: token
 *         })
 *       });
 *
 *       if (response.ok) {
 *         const data = await response.json();
 *         return {
 *           success: true,
 *           data: {
 *             tokens: {
 *               access_token: data.access_token,
 *               refresh_token: data.refresh_token
 *             }
 *           }
 *         };
 *       }
 *
 *       return { success: false };
 *     } catch (error) {
 *       console.error('OAuth token refresh failed:', error);
 *       return { success: false };
 *     }
 *   },
 *   onRefreshSuccess: (newToken) => {
 *     console.log('OAuth token refreshed successfully');
 *     // Update token in secure storage
 *     secureStorage.setTokens(newToken.tokens);
 *   },
 *   onRefreshFailure: (error) => {
 *     console.error('OAuth refresh failed:', error);
 *     // Clear tokens and redirect to login
 *     secureStorage.clearTokens();
 *     window.location.href = '/oauth/login';
 *   }
 * };
 *
 * // JWT-based custom refresh handler
 * const jwtRefreshHandler: TokenRefreshHandler = {
 *   refreshToken: async (token: string) => {
 *     const response = await axios.post('/api/auth/refresh', {
 *       refresh_token: token
 *     });
 *
 *     return {
 *       success: response.data.success,
 *       data: response.data.success ? {
 *         tokens: {
 *           access_token: response.data.access_token,
 *           refresh_token: response.data.refresh_token
 *         }
 *       } : undefined
 *     };
 *   },
 *   onRefreshSuccess: (tokens) => {
 *     localStorage.setItem('accessToken', tokens.tokens.access_token);
 *     localStorage.setItem('refreshToken', tokens.tokens.refresh_token);
 *   }
 * };
 * ```
 */
export interface TokenRefreshHandler {
  refreshToken: (
    token: string
  ) => Promise<{ success: boolean; data?: DefaultRefreshTokenResponse }>;
  onRefreshSuccess?: (newToken: DefaultRefreshTokenResponse) => void;
  onRefreshFailure?: (error: unknown) => void;
}

/**
 * Standard response format for token refresh operations.
 * Matches the expected structure from the Leastric API.
 */
interface DefaultRefreshTokenResponse {
  tokens: {
    access_token?: string;
    refresh_token?: string;
  };
}

/**
 * Robust HTTP client for the Leastric electricity monitoring application.
 * Provides automatic authentication, token refresh, retry logic, and error handling.
 *
 * Features:
 * - Automatic JWT token management
 * - Token refresh on 401 errors
 * - Exponential backoff retry logic
 * - Request/response interceptors
 * - Comprehensive error handling
 * - SSR compatibility
 *
 * @example
 * ```typescript
 * // Basic usage with default configuration
 * const apiClient = new ApiClient();
 *
 * // Get device data
 * const device = await apiClient.get<Device>('/api/devices/123');
 * console.log(device.name, device.status);
 *
 * // Post new device settings
 * const updatedDevice = await apiClient.post<Device>('/api/devices/123/settings', {
 *   refreshInterval: 30,
 *   alertThreshold: 100
 * });
 *
 * // Usage with custom configuration
 * const customClient = new ApiClient({
 *   baseURL: 'https://staging-api.leastric.com',
 *   timeout: 15000,
 *   enableRetry: true,
 *   retryOptions: {
 *     maxRetries: 5,
 *     initialDelay: 1000
 *   }
 * });
 *
 * // Enterprise usage with custom auth handler
 * const enterpriseClient = new ApiClient({
 *   baseURL: 'https://enterprise.leastric.com/api',
 *   enableTokenRefresh: true,
 *   onAuthFailure: () => {
 *     // Custom logout logic
 *     clearUserSession();
 *     redirectToSSOLogin();
 *   }
 * });
 *
 * enterpriseClient.setTokenRefreshHandler(customOAuthHandler);
 *
 * // Real-world usage in React components
 * const DeviceManager = () => {
 *   const [devices, setDevices] = useState<Device[]>([]);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     const fetchDevices = async () => {
 *       try {
 *         const deviceList = await apiClient.get<Device[]>('/api/devices');
 *         setDevices(deviceList);
 *       } catch (error) {
 *         console.error('Failed to fetch devices:', error);
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 *
 *     fetchDevices();
 *   }, []);
 *
 *   const updateDevice = async (deviceId: string, settings: DeviceSettings) => {
 *     try {
 *       const updated = await apiClient.put<Device>(
 *         `/api/devices/${deviceId}`,
 *         settings
 *       );
 *
 *       setDevices(prev =>
 *         prev.map(d => d.id === deviceId ? updated : d)
 *       );
 *     } catch (error) {
 *       console.error('Failed to update device:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {loading ? 'Loading...' : devices.map(device =>
 *         <DeviceCard key={device.id} device={device} onUpdate={updateDevice} />
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private customTokenRefreshHandler: TokenRefreshHandler | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private config: Required<ApiClientConfig>;
  private maxRefreshAttempts = 1;
  private currentRefreshAttempts = 0;

  /**
   * Creates a new ApiClient instance with the specified configuration.
   * Sets up axios instance, interceptors, and token refresh handlers.
   *
   * @param config - Optional configuration object
   *
   * @example
   * ```typescript
   * // Production client
   * const prodClient = new ApiClient({
   *   baseURL: 'https://api.leastric.com',
   *   timeout: 30000,
   *   enableRetry: true,
   *   enableTokenRefresh: true
   * });
   *
   * // Development client with debugging
   * const devClient = new ApiClient({
   *   baseURL: 'http://localhost:3001',
   *   timeout: 5000,
   *   enableRetry: false, // Faster failure for debugging
   *   disableCache: true,
   *   onAuthFailure: () => console.log('Auth failed in dev mode')
   * });
   *
   * // High-availability client with aggressive retry
   * const haClient = new ApiClient({
   *   retryOptions: {
   *     maxRetries: 10,
   *     initialDelay: 500,
   *     maxDelay: 30000,
   *     backoffFactor: 1.5
   *   }
   * });
   * ```
   */
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
      disableCache: config.disableCache ?? false,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        ...(this.config.disableCache && {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        }),
      },
    });

    this.setupInterceptors();
    this.initializeTokenRefreshHandler();
  }

  /**
   * Sets up axios request and response interceptors.
   * Handles automatic token injection and authentication error responses.
   *
   * @private
   *
   * @example
   * ```typescript
   * // Request interceptor behavior:
   * // Before: { url: '/api/devices', headers: {} }
   * // After:  { url: '/api/devices', headers: { Authorization: 'Bearer jwt-token' } }
   *
   * // Response interceptor behavior:
   * // 401 Response -> Attempt token refresh -> Retry original request
   * // 403 Response -> Clear tokens -> Redirect to login
   * // 500 Response -> Pass through to retry handler
   * ```
   */
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
   * Initializes the default token refresh handler.
   * Creates a handler that calls the API's refresh endpoint.
   *
   * @private
   *
   * @example
   * ```typescript
   * // Default refresh flow:
   * // 1. Extract refresh token from storage
   * // 2. POST to /v1/refresh with refresh token
   * // 3. Parse response for new tokens
   * // 4. Update AuthHelper with new tokens
   * // 5. Return success/failure status
   * ```
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
   * Creates the default token refresh handler implementation.
   * Handles the standard Leastric API token refresh flow.
   *
   * @private
   * @returns TokenRefreshHandler instance
   *
   * @example
   * ```typescript
   * // Default refresh request:
   * // POST /v1/refresh
   * // Body: { refresh_token: "refresh-jwt-token" }
   * // Headers: { Authorization: "Bearer current-token" }
   *
   * // Expected response:
   * // {
   * //   flash: { type: "success" },
   * //   data: {
   * //     tokens: {
   * //       access_token: "new-jwt-token",
   * //       refresh_token: "new-refresh-token"
   * //     }
   * //   }
   * // }
   * ```
   */
  private createDefaultTokenRefreshHandler(): TokenRefreshHandler {
    return {
      refreshToken: async (token: string) => {
        try {
          Logger.info("ApiClient", "Attempting token refresh...");

          // Use axios instance directly to avoid interceptors for refresh call
          const response = await axios.post<
            BaseResponse<DefaultRefreshTokenResponse>
          >(
            `${this.config.baseURL}${this.config.refreshTokenEndpoint}`,
            { refresh_token: token },
            {
              timeout: this.config.timeout,
              headers: {
                "Content-Type": "application/json",
                Authorization: this.getAuthToken(),
              },
            }
          );

          if (
            response.data.flash?.type == "success" &&
            response.data.data?.tokens
          ) {
            Logger.info("ApiClient", "Token refresh successful");
            return { success: true, data: response.data.data };
          }

          Logger.warn(
            "ApiClient",
            "Token refresh API returned failure:",
            optionalValue(response.data.flash?.message).orEmpty()
          );
          return { success: false };
        } catch (error) {
          Logger.error("ApiClient", "Token refresh API call failed:", error);
          return { success: false };
        }
      },
      onRefreshSuccess: (newToken: DefaultRefreshTokenResponse) => {
        Logger.info("ApiClient", "Token refreshed successfully:", newToken);
      },
      onRefreshFailure: (error: unknown) => {
        Logger.error("ApiClient", "Token refresh failed:", error);
      },
    };
  }

  /**
   * Sets a custom token refresh handler, overriding the default implementation.
   * Useful for custom authentication systems or OAuth providers.
   *
   * @param handler - Custom token refresh handler implementation
   *
   * @example
   * ```typescript
   * // OAuth2 integration
   * const oauthHandler: TokenRefreshHandler = {
   *   refreshToken: async (token: string) => {
   *     const response = await fetch('/oauth/token', {
   *       method: 'POST',
   *       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
   *       body: new URLSearchParams({
   *         grant_type: 'refresh_token',
   *         refresh_token: token,
   *         client_id: process.env.OAUTH_CLIENT_ID
   *       })
   *     });
   *
   *     const data = await response.json();
   *     return {
   *       success: response.ok,
   *       data: response.ok ? {
   *         tokens: {
   *           access_token: data.access_token,
   *           refresh_token: data.refresh_token
   *         }
   *       } : undefined
   *     };
   *   },
   *   onRefreshSuccess: (tokens) => {
   *     // Custom token storage
   *     secureStorage.setTokens(tokens.tokens);
   *     analytics.track('token_refreshed');
   *   },
   *   onRefreshFailure: (error) => {
   *     analytics.track('token_refresh_failed', { error });
   *     notificationService.showError('Session expired, please log in again');
   *   }
   * };
   *
   * apiClient.setTokenRefreshHandler(oauthHandler);
   *
   * // Firebase Auth integration
   * const firebaseHandler: TokenRefreshHandler = {
   *   refreshToken: async (token: string) => {
   *     try {
   *       const user = firebase.auth().currentUser;
   *       if (user) {
   *         const newToken = await user.getIdToken(true);
   *         return {
   *           success: true,
   *           data: {
   *             tokens: {
   *               access_token: newToken,
   *               refresh_token: token // Firebase handles refresh internally
   *             }
   *           }
   *         };
   *       }
   *       return { success: false };
   *     } catch (error) {
   *       return { success: false };
   *     }
   *   }
   * };
   *
   * apiClient.setTokenRefreshHandler(firebaseHandler);
   * ```
   */
  setTokenRefreshHandler(handler: TokenRefreshHandler): void {
    Logger.info("ApiClient", "Setting custom token refresh handler");
    this.customTokenRefreshHandler = handler;
  }

  /**
   * Handles authentication failures by clearing tokens and triggering logout.
   * Called when token refresh fails or 403 errors occur.
   *
   * @private
   *
   * @example
   * ```typescript
   * // Auth failure flow:
   * // 1. Clear all stored tokens
   * // 2. Reset refresh attempt counters
   * // 3. Call configured auth failure handler
   * // 4. Emit auth:failure event
   * // 5. Redirect to login page
   * ```
   */
  private async handleAuthFailure(): Promise<void> {
    Logger.warn(
      "ApiClient",
      "Authentication failed, clearing tokens and redirecting to login"
    );

    // Clear all tokens
    // this.clearTokens();

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
   * Default authentication failure handler.
   * Emits browser event and redirects to login page.
   *
   * @private
   *
   * @example
   * ```typescript
   * // Default behavior:
   * // 1. Emit 'auth:failure' event for components to listen
   * // 2. Redirect browser to /login page
   *
   * // Component listening for auth failure:
   * useEffect(() => {
   *   const handleAuthFailure = (event) => {
   *     toast.error('Session expired, please log in again');
   *     clearUserState();
   *   };
   *
   *   window.addEventListener('auth:failure', handleAuthFailure);
   *   return () => window.removeEventListener('auth:failure', handleAuthFailure);
   * }, []);
   * ```
   */
  private defaultAuthFailureHandler(): void {
    Logger.info("ApiClient", "Default auth failure handler - tokens cleared");

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
   * Sets a custom authentication failure handler.
   * Replaces the default logout/redirect behavior.
   *
   * @param handler - Custom auth failure handler function
   *
   * @example
   * ```typescript
   * // Custom auth failure with user notification
   * apiClient.setAuthFailureHandler(() => {
   *   // Show user-friendly message
   *   toast.error('Your session has expired. Please log in again.');
   *
   *   // Clear application state
   *   store.dispatch(clearUserData());
   *
   *   // Custom redirect logic
   *   if (window.location.pathname.startsWith('/admin')) {
   *     window.location.href = '/admin/login';
   *   } else {
   *     window.location.href = '/login';
   *   }
   * });
   *
   * // Enterprise SSO integration
   * apiClient.setAuthFailureHandler(() => {
   *   // Clear tokens
   *   authService.clearTokens();
   *
   *   // Redirect to SSO provider
   *   window.location.href = `${ssoConfig.baseUrl}/logout?returnUrl=${encodeURIComponent(window.location.href)}`;
   * });
   *
   * // React Router integration
   * apiClient.setAuthFailureHandler(() => {
   *   // Use React Router for navigation
   *   navigate('/login', {
   *     state: { from: location.pathname },
   *     replace: true
   *   });
   *
   *   // Show notification
   *   setNotification({
   *     type: 'warning',
   *     message: 'Please log in to continue'
   *   });
   * });
   * ```
   */
  setAuthFailureHandler(handler: () => void): void {
    Logger.info("ApiClient", "Setting custom auth failure handler");
    this.config.onAuthFailure = handler;
  }

  /**
   * Handles token refresh with concurrency control and retry limits.
   * Prevents multiple simultaneous refresh attempts and implements max retry logic.
   *
   * @private
   * @returns Promise resolving to refresh success status
   *
   * @example
   * ```typescript
   * // Token refresh scenarios:
   *
   * // Scenario 1: First 401 error
   * // -> Start refresh process
   * // -> Update tokens on success
   * // -> Retry original request
   *
   * // Scenario 2: Multiple concurrent 401s
   * // -> First request starts refresh
   * // -> Subsequent requests wait for same refresh
   * // -> All requests retry with new token
   *
   * // Scenario 3: Refresh failure
   * // -> Clear tokens
   * // -> Trigger auth failure handler
   * // -> Redirect to login
   * ```
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

  /**
   * Performs the actual token refresh operation.
   * Calls the configured token refresh handler and updates stored tokens.
   *
   * @private
   * @returns Promise resolving to refresh success status
   */
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

      Logger.info("ApiClient", "customTokenRefreshHandler result:", result);

      if (result.success && result.data?.tokens) {
        AuthHelper.setAuthTokens({
          authToken: optionalValue(result.data.tokens.access_token).orEmpty(),
          refreshToken: optionalValue(
            result.data.tokens.refresh_token
          ).orEmpty(),
        });
        this.customTokenRefreshHandler.onRefreshSuccess?.(result.data);
        Logger.info("ApiClient", "Token refresh successful", result.data);
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
   * Executes an API call with automatic retry logic.
   * Handles network failures, server errors, and implements exponential backoff.
   *
   * @template T - Response data type
   * @param apiCall - Function that performs the API request
   * @param retryOptions - Optional retry configuration overrides
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * // Basic usage with default retry
   * const deviceData = await apiClient.executeWithRetry(
   *   () => axios.get<Device>('/api/devices/123')
   * );
   *
   * // Custom retry configuration
   * const criticalData = await apiClient.executeWithRetry(
   *   () => axios.get<SummaryData>('/api/summary/critical'),
   *   {
   *     maxRetries: 5,
   *     initialDelay: 2000,
   *     onRetry: (attempt, error) => {
   *       console.log(`Critical data retry ${attempt}:`, error);
   *       analytics.track('critical_api_retry', { attempt, error });
   *     }
   *   }
   * );
   *
   * // File upload with progress tracking
   * const uploadResult = await apiClient.executeWithRetry(
   *   () => axios.post('/api/uploads', formData, {
   *     onUploadProgress: (progress) => {
   *       setUploadProgress(progress.loaded / progress.total * 100);
   *     }
   *   }),
   *   {
   *     maxRetries: 3,
   *     retryCondition: (error) => {
   *       // Don't retry file uploads on client errors
   *       const status = error?.response?.status;
   *       return !status || status >= 500;
   *     }
   *   }
   * );
   *
   * // Bulk operations with individual retry
   * const processBulkDevices = async (deviceIds: string[]) => {
   *   const results = await Promise.allSettled(
   *     deviceIds.map(id =>
   *       apiClient.executeWithRetry(
   *         () => axios.post(`/api/devices/${id}/process`),
   *         { maxRetries: 2 }
   *       )
   *     )
   *   );
   *
   *   const successful = results.filter(r => r.status === 'fulfilled').length;
   *   console.log(`Processed ${successful}/${deviceIds.length} devices`);
   * };
   * ```
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
   * Retrieves the current authentication token with Bearer prefix.
   *
   * @private
   * @returns Formatted auth token or empty string
   */
  private getAuthToken(): string {
    Logger.info("ApiClient", "Getting auth token");
    if (typeof window === "undefined") return "";
    const token = AuthHelper.getAuthToken();
    Logger.info("ApiClient", "Auth token retrieved:", token);
    return token ? `Bearer ${token}` : "";
  }

  /**
   * Retrieves the current refresh token.
   *
   * @private
   * @returns Refresh token or null
   */
  private getRefreshToken(): string | null {
    Logger.info("ApiClient", "Getting refresh token");
    if (typeof window === "undefined") return null;
    const token = AuthHelper.getRefreshToken();
    Logger.info("ApiClient", "Refresh token retrieved:", token);
    return token;
  }

  /**
   * Clears all stored authentication tokens.
   *
   * @private
   */
  private clearTokens(): void {
    Logger.info("ApiClient", "Clearing tokens");
    if (typeof window !== "undefined") {
      Logger.info("ApiClient", "Removing auth token");
      AuthHelper.clearAllUserData();
    }
  }

  /**
   * Performs HTTP GET request with automatic retry and authentication.
   *
   * @template T - Expected response data type
   * @param url - Request URL path
   * @param params - Optional query parameters
   * @param config - Optional axios request configuration
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * // Basic GET request
   * const device = await apiClient.get<Device>('/api/devices/123');
   * console.log(device.name, device.status);
   *
   * // GET with query parameters
   * const devices = await apiClient.get<Device[]>('/api/devices', {
   *   status: 'active',
   *   limit: 50,
   *   offset: 0
   * });
   *
   * // GET with custom headers
   * const report = await apiClient.get<ReportData>('/api/reports/monthly', {
   *   month: '2023-10',
   *   format: 'detailed'
   * }, {
   *   headers: {
   *     'Accept': 'application/pdf'
   *   },
   *   responseType: 'blob'
   * });
   *
   * // GET with timeout override
   * const largeSummary = await apiClient.get<SummaryData>('/api/summary/yearly', {
   *   year: 2023,
   *   includeDetails: true
   * }, {
   *   timeout: 30000 // 30 seconds for large dataset
   * });
   *
   * // Real-time usage in React
   * const useDeviceStatus = (deviceId: string) => {
   *   const [status, setStatus] = useState<DeviceStatus | null>(null);
   *   const [loading, setLoading] = useState(true);
   *
   *   useEffect(() => {
   *     const fetchStatus = async () => {
   *       try {
   *         const deviceStatus = await apiClient.get<DeviceStatus>(
   *           `/api/devices/${deviceId}/status`
   *         );
   *         setStatus(deviceStatus);
   *       } catch (error) {
   *         console.error('Failed to fetch device status:', error);
   *       } finally {
   *         setLoading(false);
   *       }
   *     };
   *
   *     fetchStatus();
   *   }, [deviceId]);
   *
   *   return { status, loading };
   * };
   * ```
   */
  async get<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = { ...(config || {}), params };
    return this.executeWithRetry(() =>
      this.axiosInstance.get<T>(url, mergedConfig)
    );
  }

  /**
   * Performs HTTP POST request with automatic retry and authentication.
   *
   * @template T - Expected response data type
   * @param url - Request URL path
   * @param data - Request body data
   * @param params - Optional query parameters
   * @param config - Optional axios request configuration
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * // Create new device
   * const newDevice = await apiClient.post<Device>('/api/devices', {
   *   name: 'Smart Meter 001',
   *   type: 'electricity',
   *   location: 'Building A'
   * });
   *
   * // Update device settings
   * const updatedDevice = await apiClient.post<Device>('/api/devices/123/settings', {
   *   refreshInterval: 30,
   *   alertThreshold: 100,
   *   notifications: {
   *     email: true,
   *     sms: false
   *   }
   * });
   *
   * // Send command to device
   * const commandResult = await apiClient.post<CommandResponse>('/api/devices/123/commands', {
   *   command: 'restart',
   *   parameters: {
   *     delay: 5000
   *   }
   * });
   *
   * // File upload
   * const formData = new FormData();
   * formData.append('file', file);
   * formData.append('deviceId', '123');
   *
   * const uploadResult = await apiClient.post<UploadResponse>('/api/uploads', formData, {}, {
   *   headers: {
   *     'Content-Type': 'multipart/form-data'
   *   },
   *   onUploadProgress: (progressEvent) => {
   *     const progress = (progressEvent.loaded / progressEvent.total) * 100;
   *     setUploadProgress(progress);
   *   }
   * });
   *
   * // Batch operations
   * const batchResult = await apiClient.post<BatchResult>('/api/devices/batch', {
   *   operation: 'update_settings',
   *   deviceIds: ['123', '456', '789'],
   *   settings: {
   *     refreshInterval: 60
   *   }
   * });
   *
   * console.log(`Updated ${batchResult.successful} of ${batchResult.total} devices`);
   * ```
   */
  async post<T>(
    url: string,
    data?: unknown,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = { ...(config || {}), params };
    return this.executeWithRetry(() =>
      this.axiosInstance.post<T>(url, data, mergedConfig)
    );
  }

  /**
   * Performs HTTP PUT request with automatic retry and authentication.
   *
   * @template T - Expected response data type
   * @param url - Request URL path
   * @param data - Request body data
   * @param params - Optional query parameters
   * @param config - Optional axios request configuration
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * // Update entire device
   * const updatedDevice = await apiClient.put<Device>(`/api/devices/123`, {
   *   name: 'Smart Meter 001 - Updated',
   *   type: 'electricity',
   *   location: 'Building A - Floor 2',
   *   settings: {
   *     refreshInterval: 30,
   *     alertThreshold: 150
   *   }
   * });
   *
   * // Replace user preferences
   * const newPreferences = await apiClient.put<UserPreferences>('/api/user/preferences', {
   *   theme: 'dark',
   *   language: 'en',
   *   notifications: {
   *     email: true,
   *     push: false,
   *     sms: true
   *   },
   *   dashboard: {
   *     layout: 'grid',
   *     refreshInterval: 30
   *   }
   * });
   *
   * // Update report configuration
   * const reportConfig = await apiClient.put<ReportConfig>('/api/reports/monthly/config', {
   *   format: 'pdf',
   *   includeCharts: true,
   *   recipients: ['admin@leastric.com', 'manager@leastric.com'],
   *   schedule: {
   *     day: 1, // First day of month
   *     time: '09:00'
   *   }
   * });
   *
   * // Bulk replace operation
   * const bulkUpdate = await apiClient.put<BulkUpdateResult>('/api/devices/settings', {
   *   deviceIds: ['123', '456', '789'],
   *   settings: {
   *     refreshInterval: 60,
   *     alertThreshold: 200
   *   }
   * });
   * ```
   */
  async put<T>(
    url: string,
    data?: unknown,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = { ...(config || {}), params };
    return this.executeWithRetry(() =>
      this.axiosInstance.put<T>(url, data, mergedConfig)
    );
  }

  /**
   * Performs HTTP PATCH request with automatic retry and authentication.
   *
   * @template T - Expected response data type
   * @param url - Request URL path
   * @param data - Request body data (partial update)
   * @param params - Optional query parameters
   * @param config - Optional axios request configuration
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * // Partial device update
   * const updatedDevice = await apiClient.patch<Device>('/api/devices/123', {
   *   name: 'Smart Meter 001 - Renamed'
   *   // Only updates the name, leaves other fields unchanged
   * });
   *
   * // Update specific device settings
   * const settingsUpdate = await apiClient.patch<Device>('/api/devices/123', {
   *   settings: {
   *     alertThreshold: 120 // Only updates alertThreshold
   *   }
   * });
   *
   * // Toggle device status
   * const statusUpdate = await apiClient.patch<Device>('/api/devices/123', {
   *   status: 'inactive'
   * });
   *
   * // Update user profile partially
   * const profileUpdate = await apiClient.patch<UserProfile>('/api/user/profile', {
   *   preferences: {
   *     theme: 'dark' // Only updates theme preference
   *   }
   * });
   *
   * // Batch partial updates
   * const batchPatch = await apiClient.patch<BatchResult>('/api/devices/batch', {
   *   updates: [
   *     { id: '123', changes: { name: 'Device 1 Updated' } },
   *     { id: '456', changes: { status: 'maintenance' } },
   *     { id: '789', changes: { settings: { alertThreshold: 90 } } }
   *   ]
   * });
   *
   * // Real-time usage for quick updates
   * const toggleDeviceStatus = async (deviceId: string, status: 'active' | 'inactive') => {
   *   try {
   *     const updated = await apiClient.patch<Device>(`/api/devices/${deviceId}`, {
   *       status
   *     });
   *
   *     toast.success(`Device ${updated.name} is now ${status}`);
   *     return updated;
   *   } catch (error) {
   *     toast.error('Failed to update device status');
   *     throw error;
   *   }
   * };
   * ```
   */
  async patch<T>(
    url: string,
    data?: unknown,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = { ...(config || {}), params };
    return this.executeWithRetry(() =>
      this.axiosInstance.patch<T>(url, data, mergedConfig)
    );
  }

  /**
   * Performs HTTP DELETE request with automatic retry and authentication.
   *
   * @template T - Expected response data type
   * @param url - Request URL path
   * @param params - Optional query parameters
   * @param config - Optional axios request configuration
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * // Delete device
   * const deleteResult = await apiClient.delete<DeleteResponse>('/api/devices/123');
   * console.log(`Device deleted: ${deleteResult.success}`);
   *
   * // Delete with confirmation parameter
   * const confirmedDelete = await apiClient.delete<DeleteResponse>('/api/devices/123', {
   *   confirm: true,
   *   reason: 'Device decommissioned'
   * });
   *
   * // Soft delete (mark as deleted but keep data)
   * const softDelete = await apiClient.delete<Device>('/api/devices/123', {
   *   soft: true
   * });
   *
   * // Delete user uploaded file
   * const fileDelete = await apiClient.delete<DeleteResponse>('/api/uploads/abc123');
   *
   * // Bulk delete operation
   * const bulkDelete = await apiClient.delete<BulkDeleteResult>('/api/devices/batch', {
   *   deviceIds: ['123', '456', '789'],
   *   force: false // Don't force delete if devices are active
   * });
   *
   * // Delete with cascade options
   * const cascadeDelete = await apiClient.delete<DeleteResponse>('/api/users/456', {
   *   cascade: true, // Delete related data
   *   transferDataTo: 'admin@leastric.com'
   * });
   *
   * // Safe delete with confirmation dialog
   * const safeDeleteDevice = async (deviceId: string, deviceName: string) => {
   *   const confirmed = window.confirm(
   *     `Are you sure you want to delete "${deviceName}"? This action cannot be undone.`
   *   );
   *
   *   if (!confirmed) return null;
   *
   *   try {
   *     const result = await apiClient.delete<DeleteResponse>(`/api/devices/${deviceId}`, {
   *       confirm: true
   *     });
   *
   *     if (result.success) {
   *       toast.success(`Device "${deviceName}" deleted successfully`);
   *       // Refresh device list
   *       refreshDeviceList();
   *     }
   *
   *     return result;
   *   } catch (error) {
   *     toast.error(`Failed to delete device: ${error.message}`);
   *     throw error;
   *   }
   * };
   * ```
   */
  async delete<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = { ...(config || {}), params };
    return this.executeWithRetry(() =>
      this.axiosInstance.delete<T>(url, mergedConfig)
    );
  }

  /**
   * Provides direct access to the underlying axios instance.
   * Use for special cases that require bypassing the retry/auth logic.
   *
   * @returns The configured axios instance
   *
   * @example
   * ```typescript
   * // Direct access for streaming responses
   * const stream = await apiClient.instance.get('/api/devices/123/stream', {
   *   responseType: 'stream'
   * });
   *
   * // Custom interceptor for specific endpoint
   * apiClient.instance.interceptors.request.use((config) => {
   *   if (config.url?.includes('/api/uploads')) {
   *     config.timeout = 60000; // 1 minute for uploads
   *   }
   *   return config;
   * });
   *
   * // WebSocket upgrade request
   * const wsUpgrade = await apiClient.instance.get('/api/realtime/upgrade', {
   *   headers: {
   *     'Upgrade': 'websocket',
   *     'Connection': 'Upgrade'
   *   }
   * });
   *
   * // Server-sent events
   * const eventSource = new EventSource(`${apiClient.instance.defaults.baseURL}/api/events`, {
   *   headers: {
   *     Authorization: AuthHelper.getAuthToken()
   *   }
   * });
   * ```
   */
  get instance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Handles and standardizes error responses consistently across the application.
   * Converts axios errors into BaseErrorResponse format with appropriate fallbacks.
   *
   * @param error - The axios error object
   * @param defaultMessage - Fallback message for network errors
   * @returns Standardized error response object
   *
   * @example
   * ```typescript
   * // Usage in try-catch blocks
   * try {
   *   const device = await apiClient.get<Device>('/api/devices/123');
   *   return device;
   * } catch (error) {
   *   const errorResponse = apiClient.handleError(
   *     error as AxiosError<BaseErrorResponse>,
   *     'Failed to load device data'
   *   );
   *
   *   // Standardized error handling
   *   if (errorResponse.statusCode === 404) {
   *     toast.error('Device not found');
   *   } else if (errorResponse.statusCode === 403) {
   *     toast.error('Access denied');
   *   } else {
   *     toast.error(errorResponse.meta.message);
   *   }
   *
   *   throw errorResponse;
   * }
   *
   * // Global error handler
   * const handleApiError = (error: unknown, context: string) => {
   *   const standardError = apiClient.handleError(
   *     error as AxiosError<BaseErrorResponse>,
   *     `Failed to ${context}`
   *   );
   *
   *   // Log error for debugging
   *   console.error(`API Error in ${context}:`, standardError);
   *
   *   // Show user notification
   *   notificationService.showError(standardError.meta.message);
   *
   *   // Track error for analytics
   *   analytics.track('api_error', {
   *     context,
   *     statusCode: standardError.statusCode,
   *     errorCode: standardError.meta.error
   *   });
   *
   *   return standardError;
   * };
   *
   * // React error boundary integration
   * const ApiErrorBoundary = ({ children }) => {
   *   return (
   *     <ErrorBoundary
   *       FallbackComponent={({ error, resetErrorBoundary }) => {
   *         const errorResponse = apiClient.handleError(error, 'load page content');
   *
   *         return (
   *           <div className="error-container">
   *             <h2>Something went wrong</h2>
   *             <p>{errorResponse.meta.message}</p>
   *             <button onClick={resetErrorBoundary}>Try again</button>
   *           </div>
   *         );
   *       }}
   *     >
   *       {children}
   *     </ErrorBoundary>
   *   );
   * };
   * ```
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
          message:
            "Network error. Please check your connection or retry later.",
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

/**
 * Creates a specialized API client instance for authentication operations.
 * Configured with optimized settings for auth-related requests.
 *
 * @param config - Optional configuration overrides
 * @returns Configured ApiClient instance for authentication
 *
 * @example
 * ```typescript
 * // Basic auth client
 * const authClient = createAuthApiClient();
 *
 * // Login request
 * const loginResult = await authClient.post<AuthResponse>('/api/auth/login', {
 *   email: 'user@example.com',
 *   password: 'securePassword'
 * });
 *
 * // Custom auth client for enterprise SSO
 * const ssoAuthClient = createAuthApiClient({
 *   baseURL: 'https://sso.enterprise.com',
 *   timeout: 30000,
 *   retryOptions: {
 *     maxRetries: 1, // Don't retry auth failures aggressively
 *     initialDelay: 2000
 *   },
 *   onAuthFailure: () => {
 *     // Custom SSO failure handling
 *     window.location.href = '/sso/expired';
 *   }
 * });
 *
 * // OAuth integration
 * const oauthClient = createAuthApiClient({
 *   baseURL: 'https://oauth.provider.com',
 *   enableTokenRefresh: false, // OAuth provider handles refresh
 *   retryOptions: {
 *     maxRetries: 2,
 *     retryCondition: (error) => {
 *       // Only retry on 5xx server errors
 *       const status = error?.response?.status;
 *       return status >= 500;
 *     }
 *   }
 * });
 *
 * // Development auth client with detailed logging
 * const devAuthClient = createAuthApiClient({
 *   timeout: 5000,
 *   retryOptions: {
 *     maxRetries: 1,
 *     onRetry: (attempt, error) => {
 *       console.log(`Auth retry ${attempt}:`, error);
 *       // Show retry notification in dev mode
 *       if (process.env.NODE_ENV === 'development') {
 *         toast.info(`Retrying authentication (${attempt})`);
 *       }
 *     }
 *   }
 * });
 *
 * // Usage in authentication service
 * class AuthService {
 *   private authClient = createAuthApiClient({
 *     onAuthFailure: this.handleAuthFailure.bind(this)
 *   });
 *
 *   async login(credentials: LoginCredentials) {
 *     try {
 *       const response = await this.authClient.post<AuthResponse>('/api/auth/login', credentials);
 *
 *       // Store tokens
 *       AuthHelper.setAuthTokens({
 *         authToken: response.access_token,
 *         refreshToken: response.refresh_token
 *       });
 *
 *       return response;
 *     } catch (error) {
 *       const authError = this.authClient.handleError(error, 'Login failed');
 *       throw authError;
 *     }
 *   }
 *
 *   private handleAuthFailure() {
 *     // Clear user state
 *     this.clearUserSession();
 *
 *     // Redirect to login
 *     this.router.navigate('/login');
 *   }
 * }
 * ```
 */
export function createAuthApiClient(
  config?: Partial<ApiClientConfig>
): ApiClient {
  return new ApiClient({
    enableTokenRefresh: true,
    enableRetry: true,
    retryOptions: {
      maxRetries: 2,
      onRetry: (attempt, error) => {
        Logger.info("Auth API", `Retry attempt ${attempt}:`, error);
      },
    },
    ...config,
  });
}
