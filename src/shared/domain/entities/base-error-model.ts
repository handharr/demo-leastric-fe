export interface BaseErrorModel {
  isError: true;
  code: string;
  message: string;
  details?: string;
  statusCode?: number;
}

export function createErrorModel(
  code: string,
  message: string,
  details?: string,
  statusCode?: number
): BaseErrorModel {
  return {
    isError: true,
    code,
    message,
    details,
    statusCode,
  };
}

export function isErrorModel<T>(
  response: T | BaseErrorModel
): response is BaseErrorModel {
  return (
    typeof response === "object" &&
    response !== null &&
    "isError" in response &&
    (response as BaseErrorModel).isError === true
  );
}
