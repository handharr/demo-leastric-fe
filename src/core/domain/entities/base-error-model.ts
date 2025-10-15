import { ErrorType, validErrorTypes } from "@/core/domain/enums/base-enum";
import { BaseErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";
export interface BaseErrorModel {
  type: ErrorType;
  message: string;
  details?: string;
  statusCode?: number;
  validationErrors?: Record<string, string>;
}

// Map BaseErrorResponse to BaseErrorModel
export function mapErrorResponseToModel({
  response,
}: {
  response: BaseErrorResponse;
}): BaseErrorModel {
  return createErrorModel({
    message: optionalValue(response?.meta?.message).orEmpty(),
    details: optionalValue(response?.meta?.error).orEmpty(),
    statusCode: optionalValue(response?.meta?.statusCode).orZero(),
  });
}

export function createErrorModel({
  message,
  details,
  statusCode,
  type = ErrorType.UNEXPECTED,
  validationErrors,
}: {
  message: string;
  details?: string;
  statusCode?: number;
  type?: ErrorType;
  validationErrors?: Record<string, string>;
}): BaseErrorModel {
  return {
    type,
    message,
    details,
    statusCode,
    validationErrors,
  };
}

export function isErrorModel<T>(
  response: T | BaseErrorModel
): response is BaseErrorModel {
  return (
    typeof response === "object" &&
    response !== null &&
    "type" in response &&
    "message" in response &&
    typeof (response as BaseErrorModel).message === "string" &&
    typeof (response as BaseErrorModel).type === "string" &&
    validErrorTypes.includes((response as BaseErrorModel).type as ErrorType) &&
    "statusCode" in response &&
    (response as BaseErrorModel).statusCode !== undefined
  );
}

// Helper functions to check error types
export function isValidationError({
  error,
}: {
  error: BaseErrorModel;
}): boolean {
  return error.type === "VALIDATION";
}

export function isNetworkError({ error }: { error: BaseErrorModel }): boolean {
  return error.type === "NETWORK";
}

export function isServerError({ error }: { error: BaseErrorModel }): boolean {
  return error.type === "SERVER";
}

export function isAuthenticationError({
  error,
}: {
  error: BaseErrorModel;
}): boolean {
  return error.type === "AUTHENTICATION";
}

export function handleErrorResponse({
  error,
  defaultMessage,
}: {
  error: BaseErrorResponse; // More flexible error type to handle different error structures
  defaultMessage: string;
}): BaseErrorModel {
  const statusCode = optionalValue(error.statusCode).orDefault(500);

  const errorType = determineErrorType({
    statusCode,
  });

  return createErrorModel({
    message: error.meta?.message || defaultMessage,
    details: error.meta?.error,
    statusCode,
    type: errorType,
  });
}

/**
 * Determine error type based on HTTP status code and response data
 */
export function determineErrorType({
  statusCode,
}: {
  statusCode: number;
}): ErrorType {
  // Categorize based on HTTP status codes
  switch (true) {
    case statusCode >= 400 && statusCode < 500:
      if (statusCode === 401 || statusCode === 403) {
        return ErrorType.AUTHENTICATION;
      }
      if (statusCode === 422) {
        return ErrorType.VALIDATION;
      }
      return ErrorType.CLIENT;

    case statusCode >= 500:
      return ErrorType.SERVER;

    default:
      return ErrorType.UNEXPECTED;
  }
}
