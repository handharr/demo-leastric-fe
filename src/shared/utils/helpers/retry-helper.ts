/**
 * Retry handler utility for API calls with exponential backoff.
 * Provides robust error handling and automatic retry logic for network operations
 * in the web-leastric electricity monitoring application.
 */

/**
 * Configuration options for retry behavior.
 * Allows customization of retry attempts, delays, and conditions.
 *
 * @property maxRetries - Maximum number of retry attempts (default: 3)
 * @property initialDelay - Initial delay in milliseconds before first retry (default: 1000ms)
 * @property maxDelay - Maximum delay between retries in milliseconds (default: 10000ms)
 * @property backoffFactor - Exponential backoff multiplier (default: 2)
 * @property retryCondition - Function to determine if error should be retried
 * @property onRetry - Callback function called on each retry attempt
 *
 * @example
 * ```typescript
 * // Basic retry configuration
 * const basicOptions: RetryOptions = {
 *   maxRetries: 3,
 *   initialDelay: 1000
 * };
 *
 * // Advanced configuration with custom retry condition
 * const advancedOptions: RetryOptions = {
 *   maxRetries: 5,
 *   initialDelay: 500,
 *   maxDelay: 8000,
 *   backoffFactor: 1.5,
 *   retryCondition: (error) => {
 *     // Only retry on specific HTTP status codes
 *     if (error && typeof error === "object" && "response" in error) {
 *       const status = (error as any).response?.status;
 *       return status === 429 || status >= 500;
 *     }
 *     return true;
 *   },
 *   onRetry: (attempt, error) => {
 *     console.log(`Retry attempt ${attempt} due to:`, error);
 *   }
 * };
 * ```
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Result object returned by retry operations.
 * Contains success status, data/error, and attempt count for monitoring.
 *
 * @property success - Whether the operation ultimately succeeded
 * @property data - The successful result data (if success is true)
 * @property error - The final error (if success is false)
 * @property attempts - Total number of attempts made
 *
 * @example
 * ```typescript
 * // Successful result
 * const successResult: RetryResult<UserData> = {
 *   success: true,
 *   data: { id: 123, name: "John Doe" },
 *   attempts: 2
 * };
 *
 * // Failed result
 * const failedResult: RetryResult<UserData> = {
 *   success: false,
 *   error: new Error("Network timeout"),
 *   attempts: 4
 * };
 * ```
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
}

/**
 * Main retry handler class providing robust retry mechanisms with exponential backoff.
 * Designed for electricity monitoring API calls that may experience temporary failures.
 */
export class RetryHandler {
  /**
   * Default configuration values for retry operations.
   * Provides sensible defaults for most electricity monitoring API scenarios.
   */
  private static defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error: unknown) => {
      // Default: retry on network errors and 5xx server errors
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status: number } };
        const status = axiosError.response?.status;
        return !status || status >= 500 || status === 408 || status === 429;
      }
      return true; // Retry on network errors
    },
    onRetry: () => {},
  };

  /**
   * Executes a function with automatic retry logic and exponential backoff.
   * Handles transient failures common in electricity monitoring systems.
   *
   * @param fn - Async function to execute with retry logic
   * @param options - Retry configuration options
   * @returns Promise resolving to RetryResult with success/failure details
   *
   * @example
   * ```typescript
   * // Basic API call with default retry
   * const fetchDeviceData = async () => {
   *   const response = await axios.get('/api/devices/123');
   *   return response.data;
   * };
   *
   * const result = await RetryHandler.withRetry(fetchDeviceData);
   * if (result.success) {
   *   console.log('Device data:', result.data);
   *   console.log(`Retrieved in ${result.attempts} attempts`);
   * } else {
   *   console.error('Failed to fetch device data:', result.error);
   * }
   *
   * // Custom retry configuration for critical operations
   * const fetchSummaryData = async () => {
   *   const response = await axios.get('/api/summary/electricity-usage', {
   *     timeout: 5000
   *   });
   *   return response.data;
   * };
   *
   * const summaryResult = await RetryHandler.withRetry(fetchSummaryData, {
   *   maxRetries: 5,
   *   initialDelay: 2000,
   *   backoffFactor: 1.5,
   *   onRetry: (attempt, error) => {
   *     console.log(`Retrying summary fetch (attempt ${attempt}):`, error);
   *   }
   * });
   *
   * // Real-time data subscription with network retry
   * const connectToRealTimeData = async () => {
   *   const ws = new WebSocket('wss://api.leastric.com/real-time');
   *   return new Promise((resolve, reject) => {
   *     ws.onopen = () => resolve(ws);
   *     ws.onerror = reject;
   *   });
   * };
   *
   * const wsResult = await RetryHandler.withRetry(connectToRealTimeData, {
   *   maxRetries: 10,
   *   initialDelay: 1000,
   *   maxDelay: 30000,
   *   retryCondition: (error) => {
   *     // Always retry WebSocket connection failures
   *     return true;
   *   },
   *   onRetry: (attempt) => {
   *     console.log(`Reconnecting to real-time data (attempt ${attempt})`);
   *   }
   * });
   *
   * // Authentication with retry but exclude auth errors
   * const authenticateUser = async (credentials: LoginCredentials) => {
   *   const response = await axios.post('/api/auth/login', credentials);
   *   return response.data;
   * };
   *
   * const authResult = await RetryHandler.withRetry(
   *   () => authenticateUser({ email, password }),
   *   {
   *     maxRetries: 2,
   *     retryCondition: RetryHandler.createAuthRetryCondition(true),
   *     onRetry: (attempt) => {
   *       console.log(`Retrying authentication (attempt ${attempt})`);
   *     }
   *   }
   * );
   *
   * // Database operation with custom error handling
   * const saveDeviceSettings = async (deviceId: string, settings: DeviceSettings) => {
   *   const response = await axios.put(`/api/devices/${deviceId}/settings`, settings);
   *   return response.data;
   * };
   *
   * const saveResult = await RetryHandler.withRetry(
   *   () => saveDeviceSettings("device-123", { interval: 30, threshold: 100 }),
   *   {
   *     maxRetries: 3,
   *     retryCondition: (error) => {
   *       if (error && typeof error === "object" && "response" in error) {
   *         const status = (error as any).response?.status;
   *         // Don't retry client errors (400-499) except rate limiting
   *         return status >= 500 || status === 429 || status === 408;
   *       }
   *       return true;
   *     }
   *   }
   * );
   *
   * // Usage in React hooks
   * const useDeviceData = (deviceId: string) => {
   *   const [data, setData] = useState(null);
   *   const [loading, setLoading] = useState(true);
   *   const [error, setError] = useState(null);
   *
   *   useEffect(() => {
   *     const fetchData = async () => {
   *       setLoading(true);
   *       const result = await RetryHandler.withRetry(
   *         () => axios.get(`/api/devices/${deviceId}`).then(res => res.data)
   *       );
   *
   *       if (result.success) {
   *         setData(result.data);
   *         setError(null);
   *       } else {
   *         setError(result.error);
   *       }
   *       setLoading(false);
   *     };
   *
   *     fetchData();
   *   }, [deviceId]);
   *
   *   return { data, loading, error };
   * };
   *
   * // Bulk operations with individual retry
   * const syncMultipleDevices = async (deviceIds: string[]) => {
   *   const results = await Promise.allSettled(
   *     deviceIds.map(id =>
   *       RetryHandler.withRetry(
   *         () => axios.post(`/api/devices/${id}/sync`),
   *         { maxRetries: 2 }
   *       )
   *     )
   *   );
   *
   *   const successful = results.filter(r =>
   *     r.status === 'fulfilled' && r.value.success
   *   ).length;
   *
   *   console.log(`Successfully synced ${successful}/${deviceIds.length} devices`);
   * };
   * ```
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: unknown;
    let delay = config.initialDelay;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await fn();
        return {
          success: true,
          data: result,
          attempts: attempt + 1,
        };
      } catch (error) {
        lastError = error;

        // Don't retry if this is the last attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Check if we should retry this error
        if (!config.retryCondition(error)) {
          break;
        }

        // Call retry callback
        config.onRetry(attempt + 1, error);

        // Wait before retrying
        await this.delay(delay);

        // Increase delay for next attempt (exponential backoff)
        delay = Math.min(delay * config.backoffFactor, config.maxDelay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: config.maxRetries + 1,
    };
  }

  /**
   * Creates a delay for the specified number of milliseconds.
   * Used internally for implementing retry delays and exponential backoff.
   *
   * @param ms - Number of milliseconds to delay
   * @returns Promise that resolves after the specified delay
   *
   * @example
   * ```typescript
   * // Manual delay usage (internal method)
   * await RetryHandler.delay(1000); // Wait 1 second
   *
   * // Exponential backoff calculation example:
   * // Attempt 1: 1000ms delay
   * // Attempt 2: 2000ms delay (1000 * 2)
   * // Attempt 3: 4000ms delay (2000 * 2)
   * // Attempt 4: 8000ms delay (4000 * 2)
   * // Attempt 5: 10000ms delay (capped at maxDelay)
   * ```
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Creates a specialized retry condition function for authentication scenarios.
   * Provides fine-grained control over which authentication errors should be retried.
   *
   * @param excludeAuthErrors - Whether to exclude 401/403 errors from retry attempts
   * @returns Function that determines if an error should be retried
   *
   * @example
   * ```typescript
   * // Don't retry authentication failures (401/403)
   * const authRetryCondition = RetryHandler.createAuthRetryCondition(true);
   *
   * const loginResult = await RetryHandler.withRetry(
   *   () => authService.login(credentials),
   *   {
   *     maxRetries: 3,
   *     retryCondition: authRetryCondition
   *   }
   * );
   *
   * // Include auth errors in retry (useful for token refresh scenarios)
   * const tokenRefreshCondition = RetryHandler.createAuthRetryCondition(false);
   *
   * const refreshResult = await RetryHandler.withRetry(
   *   () => authService.refreshToken(),
   *   {
   *     maxRetries: 2,
   *     retryCondition: tokenRefreshCondition
   *   }
   * );
   *
   * // Custom usage with different HTTP status codes
   * const customRetryCondition = (error: unknown) => {
   *   if (error && typeof error === "object" && "response" in error) {
   *     const status = (error as any).response?.status;
   *
   *     // Custom logic for electricity monitoring API
   *     switch (status) {
   *       case 401: // Unauthorized - don't retry, redirect to login
   *         return false;
   *       case 403: // Forbidden - don't retry, show access denied
   *         return false;
   *       case 404: // Not found - don't retry, resource doesn't exist
   *         return false;
   *       case 408: // Request timeout - retry
   *       case 429: // Rate limited - retry with backoff
   *       case 502: // Bad gateway - retry
   *       case 503: // Service unavailable - retry
   *       case 504: // Gateway timeout - retry
   *         return true;
   *       default:
   *         return status >= 500; // Retry other server errors
   *     }
   *   }
   *   return true; // Retry network errors
   * };
   *
   * // Real-world authentication flow with retry
   * const authenticateWithRetry = async (credentials: LoginCredentials) => {
   *   // First attempt: login
   *   const loginResult = await RetryHandler.withRetry(
   *     () => authAPI.login(credentials),
   *     {
   *       maxRetries: 2,
   *       retryCondition: RetryHandler.createAuthRetryCondition(true),
   *       onRetry: (attempt, error) => {
   *         console.log(`Login retry attempt ${attempt}:`, error);
   *       }
   *     }
   *   );
   *
   *   if (loginResult.success) {
   *     // Store tokens
   *     localStorage.setItem('authToken', loginResult.data.accessToken);
   *     localStorage.setItem('refreshToken', loginResult.data.refreshToken);
   *     return loginResult;
   *   }
   *
   *   // Handle login failure
   *   if (loginResult.error && typeof loginResult.error === 'object' &&
   *       'response' in loginResult.error) {
   *     const status = (loginResult.error as any).response?.status;
   *
   *     if (status === 401) {
   *       throw new Error('Invalid credentials');
   *     } else if (status === 403) {
   *       throw new Error('Account locked or suspended');
   *     } else {
   *       throw new Error('Login service temporarily unavailable');
   *     }
   *   }
   *
   *   throw new Error('Network error during login');
   * };
   *
   * // API call with automatic token refresh and retry
   * const apiCallWithAuth = async (endpoint: string, options: RequestOptions) => {
   *   const makeRequest = async () => {
   *     const token = localStorage.getItem('authToken');
   *     return axios.get(endpoint, {
   *       ...options,
   *       headers: {
   *         ...options.headers,
   *         Authorization: `Bearer ${token}`
   *       }
   *     });
   *   };
   *
   *   const result = await RetryHandler.withRetry(makeRequest, {
   *     maxRetries: 1,
   *     retryCondition: (error) => {
   *       // Only retry on 401 (token expired)
   *       if (error && typeof error === "object" && "response" in error) {
   *         return (error as any).response?.status === 401;
   *       }
   *       return false;
   *     },
   *     onRetry: async () => {
   *       // Refresh token on 401 error
   *       const refreshToken = localStorage.getItem('refreshToken');
   *       const refreshResult = await authAPI.refreshToken(refreshToken);
   *       localStorage.setItem('authToken', refreshResult.accessToken);
   *     }
   *   });
   *
   *   return result;
   * };
   * ```
   */
  static createAuthRetryCondition(excludeAuthErrors = false) {
    return (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status: number } };
        const status = axiosError.response?.status;

        // Don't retry auth errors if excluded
        if (excludeAuthErrors && (status === 401 || status === 403)) {
          return false;
        }

        // Retry on server errors, timeouts, and rate limits
        return !status || status >= 500 || status === 408 || status === 429;
      }
      return true;
    };
  }
}
