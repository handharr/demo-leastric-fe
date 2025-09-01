export enum ErrorType {
  VALIDATION = "VALIDATION",
  NETWORK = "NETWORK",
  SERVER = "SERVER",
  CLIENT = "CLIENT",
  AUTHENTICATION = "AUTHENTICATION",
  UNEXPECTED = "UNEXPECTED",
}

export const validErrorTypes: ErrorType[] = [
  ErrorType.VALIDATION,
  ErrorType.NETWORK,
  ErrorType.SERVER,
  ErrorType.CLIENT,
  ErrorType.AUTHENTICATION,
  ErrorType.UNEXPECTED,
];
