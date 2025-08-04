import { LoginValidationErrors } from "@/features/auth/domain/entities/login-validation-errors";

export interface LoginResultModel {
  success: boolean;
  errors?: LoginValidationErrors;
  token: string;
}
