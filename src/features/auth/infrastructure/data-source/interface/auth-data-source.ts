import { LoginResponse } from "@/features/auth/infrastructure/model/login/login-response";
import { RefreshTokenResponse } from "@/features/auth/infrastructure/model/login/refresh-token-response";
import { ValidateTokenResponse } from "@/features/auth/infrastructure/model/login/validate-token-response";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { ResetPasswordResponse } from "@/features/auth/infrastructure/model/reset-password/reset-password-response";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { BaseResponse } from "@/shared/infrastructure/model/base-response";

export interface AuthDataSource {
  login(
    email: string,
    password: string
  ): Promise<BaseResponse<LoginResponse> | BaseErrorModel>;
  logout(): Promise<void | BaseErrorModel>;
  refreshToken(token: string): Promise<RefreshTokenResponse | BaseErrorModel>;
  validateToken(token: string): Promise<ValidateTokenResponse | BaseErrorModel>;
  resetPassword(
    params: ResetPasswordData
  ): Promise<ResetPasswordResponse | BaseErrorModel>;
}
