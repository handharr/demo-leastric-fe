import { AxiosError } from "axios";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";

export class AxiosErrorHandler {
  /**
   * Generic error response handler with type parsing
   */
  static handleErrorResponse<T extends BaseErrorResponse>(
    error: AxiosError<T>,
    code: string,
    defaultMessage: string
  ): BaseErrorModel {
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;

      // Extract message from various possible fields
      const serverMessage =
        errorData?.message ||
        errorData?.error ||
        errorData?.details ||
        (typeof errorData === "string" ? errorData : defaultMessage);

      return createErrorModel(
        code,
        serverMessage,
        JSON.stringify(errorData),
        statusCode
      );
    } else if (error.request) {
      // Network error
      return createErrorModel(
        "NETWORK_ERROR",
        "Network connection failed",
        error.message
      );
    } else {
      // Other error
      return createErrorModel(code, defaultMessage, error.message);
    }
  }

  /**
   * Create a standardized network error
   */
  static createNetworkError(details?: string): BaseErrorModel {
    return createErrorModel(
      "NETWORK_ERROR",
      "Network connection failed",
      details
    );
  }

  /**
   * Create a standardized timeout error
   */
  static createTimeoutError(details?: string): BaseErrorModel {
    return createErrorModel("TIMEOUT_ERROR", "Request timed out", details);
  }

  /**
   * Create a standardized validation error
   */
  static createValidationError(
    message: string,
    details?: string
  ): BaseErrorModel {
    return createErrorModel("VALIDATION_ERROR", message, details);
  }
}
