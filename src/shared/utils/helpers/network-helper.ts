import { AxiosError } from "axios";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";

export function handleErrorResponse(
  error: AxiosError<BaseErrorResponse>,
  defaultErrorCode: string,
  defaultMessage: string
): BaseErrorResponse {
  console.error(`${defaultErrorCode}:`, error);

  // Handle network errors
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

  return error.response.data;
}
