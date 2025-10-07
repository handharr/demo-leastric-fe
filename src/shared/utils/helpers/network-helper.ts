import { AxiosError, AxiosResponse } from "axios";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { Logger } from "@/shared/utils/logger/logger";

/**
 * Handles and standardizes error responses from Axios HTTP requests.
 * Processes network errors and API error responses into a consistent format.
 * Logs errors for debugging purposes and provides fallback error messages.
 *
 * @param error - The Axios error object containing request/response information
 * @param defaultErrorCode - Custom error code for logging and identification
 * @param defaultMessage - Fallback error message when network errors occur
 * @returns Standardized BaseErrorResponse object with error details
 *
 * @example
 * ```typescript
 * // Network error (no internet connection, server unreachable)
 * const networkError = new AxiosError("Network Error");
 * networkError.response = undefined; // No response received
 *
 * const result = handleErrorResponse(
 *   networkError,
 *   "AUTH_LOGIN_ERROR",
 *   "Unable to connect to authentication server"
 * );
 * // Output:
 * // {
 * //   statusCode: 0,
 * //   meta: {
 * //     message: "Unable to connect to authentication server",
 * //     error: "NETWORK_ERROR",
 * //     statusCode: 0
 * //   }
 * // }
 *
 * // API error response (400 Bad Request)
 * const apiError = new AxiosError("Bad Request");
 * apiError.response = {
 *   status: 400,
 *   data: {
 *     statusCode: 400,
 *     meta: {
 *       message: "Invalid email or password",
 *       error: "INVALID_CREDENTIALS",
 *       statusCode: 400
 *     }
 *   }
 * };
 *
 * const apiResult = handleErrorResponse(
 *   apiError,
 *   "AUTH_LOGIN_ERROR",
 *   "Login failed"
 * );
 * // Output:
 * // {
 * //   statusCode: 400,
 * //   meta: {
 * //     message: "Invalid email or password",
 * //     error: "INVALID_CREDENTIALS",
 * //     statusCode: 400
 * //   }
 * // }
 *
 * // Server error (500 Internal Server Error)
 * const serverError = new AxiosError("Internal Server Error");
 * serverError.response = {
 *   status: 500,
 *   data: {
 *     statusCode: 500,
 *     meta: {
 *       message: "Database connection failed",
 *       error: "DATABASE_ERROR",
 *       statusCode: 500
 *     }
 *   }
 * };
 *
 * const serverResult = handleErrorResponse(
 *   serverError,
 *   "DEVICE_FETCH_ERROR",
 *   "Failed to load device data"
 * );
 * // Output:
 * // {
 * //   statusCode: 500,
 * //   meta: {
 * //     message: "Database connection failed",
 * //     error: "DATABASE_ERROR",
 * //     statusCode: 500
 * //   }
 * // }
 *
 * // Timeout error (no response)
 * const timeoutError = new AxiosError("Timeout");
 * timeoutError.code = "ECONNABORTED";
 * timeoutError.response = undefined;
 *
 * const timeoutResult = handleErrorResponse(
 *   timeoutError,
 *   "SUMMARY_DATA_ERROR",
 *   "Request timed out while fetching summary data"
 * );
 * // Output:
 * // {
 * //   statusCode: 0,
 * //   meta: {
 * //     message: "Request timed out while fetching summary data",
 * //     error: "NETWORK_ERROR",
 * //     statusCode: 0
 * //   }
 * // }
 *
 * // Usage in API call handlers
 * try {
 *   const response = await axios.get('/api/devices');
 *   return response.data;
 * } catch (error) {
 *   const errorResponse = handleErrorResponse(
 *     error as AxiosError<BaseErrorResponse>,
 *     "DEVICE_LIST_ERROR",
 *     "Failed to fetch device list. Please try again."
 *   );
 *   throw errorResponse;
 * }
 *
 * // Usage in React hooks
 * const { data, error } = useSWR('/api/summary', async (url) => {
 *   try {
 *     const response = await axios.get(url);
 *     return response.data;
 *   } catch (err) {
 *     const errorResponse = handleErrorResponse(
 *       err as AxiosError<BaseErrorResponse>,
 *       "SUMMARY_FETCH_ERROR",
 *       "Unable to load electricity usage summary"
 *     );
 *     throw errorResponse;
 *   }
 * });
 * ```
 */
export function handleErrorResponse(
  error: AxiosError<BaseErrorResponse>,
  defaultErrorCode: string,
  defaultMessage: string
): BaseErrorResponse {
  console.error(`${defaultErrorCode}:`, error);

  // Handle network errors (no response received)
  // This includes: DNS resolution failures, connection timeouts,
  // network unreachable, server not responding, etc.
  if (!error.response) {
    return {
      statusCode: 0,
      meta: {
        message:
          defaultMessage || "Network error. Please check your connection.",
        error: "NETWORK_ERROR",
        statusCode: 0,
      },
    };
  }

  // Return the actual API error response
  // This preserves the original error structure from the server
  return error.response.data;
}

/**
 * Determines if an error should be retried based on status code and error type.
 * Implements retry logic for network errors and specific HTTP status codes.
 *
 * @param error - The error to evaluate
 * @returns true if the error should be retried, false otherwise
 *
 * @example
 * ```typescript
 * // Network errors should be retried
 * const networkError = new AxiosError("Network Error");
 * console.log(shouldRetryError(networkError)); // true
 *
 * // 429 (Too Many Requests) should be retried
 * const rateLimitError = new AxiosError();
 * rateLimitError.response = { status: 429 };
 * console.log(shouldRetryError(rateLimitError)); // true
 *
 * // 400 (Bad Request) should not be retried
 * const badRequestError = new AxiosError();
 * badRequestError.response = { status: 400 };
 * console.log(shouldRetryError(badRequestError)); // false
 * ```
 */
export function shouldRetryError(error: unknown): boolean {
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
}

/**
 * Checks if an error is an authentication-related error (401 or 403).
 * Used to determine if token refresh or auth failure handling is needed.
 *
 * @param error - The error to check
 * @returns Object indicating if it's 401 or 403 error
 *
 * @example
 * ```typescript
 * const authError = new AxiosError();
 * authError.response = { status: 401 };
 *
 * const result = isAuthError(authError);
 * console.log(result); // { is401: true, is403: false, isAuthError: true }
 * ```
 */
export function isAuthError(error: unknown): {
  is401: boolean;
  is403: boolean;
  isAuthError: boolean;
} {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const is401 = status === 401;
    const is403 = status === 403;
    return {
      is401,
      is403,
      isAuthError: is401 || is403,
    };
  }
  return { is401: false, is403: false, isAuthError: false };
}

/**
 * Creates standardized headers for API requests.
 * Includes content type, cache control, and authentication headers.
 *
 * @param authToken - Optional authentication token
 * @param disableCache - Whether to add no-cache headers
 * @param customHeaders - Additional custom headers
 * @returns Object containing request headers
 *
 * @example
 * ```typescript
 * // Basic headers
 * const headers = createRequestHeaders();
 * // { "Content-Type": "application/json" }
 *
 * // With authentication
 * const authHeaders = createRequestHeaders("Bearer jwt-token");
 * // { "Content-Type": "application/json", "Authorization": "Bearer jwt-token" }
 *
 * // With cache disabled
 * const noCacheHeaders = createRequestHeaders(undefined, true);
 * // {
 * //   "Content-Type": "application/json",
 * //   "Cache-Control": "no-cache, no-store, must-revalidate",
 * //   "Pragma": "no-cache",
 * //   "Expires": "0"
 * // }
 * ```
 */
export function createRequestHeaders(
  authToken?: string,
  disableCache?: boolean,
  customHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (authToken) {
    headers.Authorization = authToken;
  }

  if (disableCache) {
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    headers.Pragma = "no-cache";
    headers.Expires = "0";
  }

  return headers;
}

/**
 * Logs request details for debugging purposes.
 * Provides consistent logging format for API requests.
 *
 * @param method - HTTP method
 * @param url - Request URL
 * @param data - Optional request data
 * @param attempt - Optional retry attempt number
 *
 * @example
 * ```typescript
 * logRequest("GET", "/api/devices", undefined, 1);
 * // Logs: "API Request [GET] /api/devices (attempt 1)"
 *
 * logRequest("POST", "/api/devices", { name: "New Device" });
 * // Logs: "API Request [POST] /api/devices" with data
 * ```
 */
export function logRequest(
  method: string,
  url: string,
  data?: unknown,
  attempt?: number
): void {
  const attemptText = attempt ? ` (attempt ${attempt})` : "";
  Logger.info("NetworkHelper", `API Request [${method}] ${url}${attemptText}`);

  if (data) {
    Logger.debug("NetworkHelper", "Request data:", data);
  }
}

/**
 * Logs response details for debugging purposes.
 * Provides consistent logging format for API responses.
 *
 * @param method - HTTP method
 * @param url - Request URL
 * @param response - Axios response object
 *
 * @example
 * ```typescript
 * logResponse("GET", "/api/devices", response);
 * // Logs: "API Response [GET] /api/devices - 200"
 * ```
 */
export function logResponse<T>(
  method: string,
  url: string,
  response: AxiosResponse<T>
): void {
  Logger.info(
    "NetworkHelper",
    `API Response [${method}] ${url} - ${response.status}`
  );
  Logger.debug("NetworkHelper", "Response data:", response.data);
}

/**
 * Extracts meaningful error information from various error types.
 * Handles AxiosError, network errors, and generic errors consistently.
 *
 * @param error - The error to extract information from
 * @returns Object with extracted error details
 *
 * @example
 * ```typescript
 * const errorInfo = extractErrorInfo(axiosError);
 * console.log(errorInfo);
 * // {
 * //   statusCode: 400,
 * //   message: "Invalid request",
 * //   errorCode: "VALIDATION_ERROR",
 * //   isNetworkError: false,
 * //   isTimeout: false
 * // }
 * ```
 */
export function extractErrorInfo(error: unknown): {
  statusCode: number;
  message: string;
  errorCode: string;
  isNetworkError: boolean;
  isTimeout: boolean;
} {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<BaseErrorResponse>;

    if (axiosError.response) {
      return {
        statusCode: axiosError.response.status,
        message: axiosError.response.data?.meta?.message || axiosError.message,
        errorCode: axiosError.response.data?.meta?.error || "API_ERROR",
        isNetworkError: false,
        isTimeout: axiosError.code === "ECONNABORTED",
      };
    }
  }

  // Network error or unknown error
  return {
    statusCode: 0,
    message: error instanceof Error ? error.message : "Unknown error",
    errorCode: "NETWORK_ERROR",
    isNetworkError: true,
    isTimeout: false,
  };
}

/**
 * Validates if a request should be attempted based on current state.
 * Checks for required parameters and network conditions.
 *
 * @param url - Request URL
 * @param options - Validation options
 * @returns Validation result with success status and error message
 *
 * @example
 * ```typescript
 * const validation = validateRequest("/api/devices", {
 *   requireAuth: true,
 *   authToken: "Bearer token"
 * });
 *
 * if (!validation.isValid) {
 *   console.error(validation.error);
 *   return;
 * }
 * ```
 */
export function validateRequest(
  url: string,
  options?: {
    requireAuth?: boolean;
    authToken?: string;
    checkNetwork?: boolean;
  }
): { isValid: boolean; error?: string } {
  if (!url || url.trim() === "") {
    return { isValid: false, error: "URL is required" };
  }

  if (options?.requireAuth && !options.authToken) {
    return { isValid: false, error: "Authentication token is required" };
  }

  if (
    options?.checkNetwork &&
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {
    return { isValid: false, error: "No network connection" };
  }

  return { isValid: true };
}
