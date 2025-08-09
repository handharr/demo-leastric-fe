export type ErrorType =
  | "VALIDATION"
  | "NETWORK"
  | "SERVER"
  | "CLIENT"
  | "AUTHENTICATION"
  | "UNEXPECTED";

export const validErrorTypes: ErrorType[] = [
  "VALIDATION",
  "NETWORK",
  "SERVER",
  "CLIENT",
  "AUTHENTICATION",
  "UNEXPECTED",
];
