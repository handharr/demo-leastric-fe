import { AxiosError } from "axios";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";

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
