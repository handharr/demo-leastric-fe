import { AxiosError } from "axios";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { storage } from "@/shared/utils/helpers/storage-helper";

export function handleErrorResponse(
  error: AxiosError<BaseErrorResponse>,
  defaultErrorCode: string,
  defaultMessage: string
): BaseErrorResponse {
  console.error(`${defaultErrorCode}:`, error);

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
    error: responseData?.error || defaultErrorCode,
    details: responseData?.details || error.message,
    statusCode,
  };
}

export function getAuthToken(): string {
  if (typeof window === "undefined") return "";

  const token = storage.getAuthToken();
  return token ? `Bearer ${token}` : "";
}

export function clearLocalTokens(): void {
  if (typeof window === "undefined") return;

  storage.clearAuthData();
  storage.clearAuthData({ options: { useSessionStorage: true } });
}
