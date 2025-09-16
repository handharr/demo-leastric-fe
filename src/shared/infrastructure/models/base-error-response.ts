import { optional } from "@/shared/utils/wrappers/optional-wrapper";
export interface BaseErrorResponse {
  statusCode?: number;
  timestamp?: string;
  path?: string;
  method?: string;
  meta?: {
    message?: string;
    error?: string;
    statusCode?: number;
  };
}

export function isErrorResponse<T>(
  response: T | BaseErrorResponse
): response is BaseErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    typeof (response as BaseErrorResponse).meta?.message === "string" &&
    typeof (response as BaseErrorResponse).meta?.statusCode === "number" &&
    (optional((response as BaseErrorResponse).meta?.statusCode).orZero() <
      200 ||
      optional((response as BaseErrorResponse).meta?.statusCode).orZero() >=
        300)
  );
}
