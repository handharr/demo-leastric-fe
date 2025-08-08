import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";
import { LoginResultModel } from "@/features/auth/domain/entities/login-result-model";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { ResetPasswordResponse } from "@/features/auth/infrastructure/model/reset-password/reset-password-response";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { UserModel } from "@/features/auth/domain/entities/user-model";

export interface AuthRepository {
  login(data: LoginFormData): Promise<UserModel | BaseErrorModel>;
  logout(): Promise<void | BaseErrorModel>;
  refreshToken(token: string): Promise<LoginResultModel | BaseErrorModel>;
  validateToken(token: string): Promise<boolean>;
  resetPassword(
    params: ResetPasswordData
  ): Promise<ResetPasswordResponse | BaseErrorModel>;
}
