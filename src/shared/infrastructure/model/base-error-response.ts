export interface BaseErrorResponse {
  message?: string;
  error?: string;
  details?: string;
  statusCode?: number;
}

export function isErrorResponse<T>(
  response: T | BaseErrorResponse
): response is BaseErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "message" in response &&
    typeof (response as BaseErrorResponse).message === "string" &&
    "statusCode" in response &&
    typeof (response as BaseErrorResponse).statusCode === "number" &&
    "details" in response &&
    typeof (response as BaseErrorResponse).details === "string"
  );
}
