import { LoginResponse } from "@/features/auth/infrastructure/model/login/login-response";
import { RefreshTokenResponse } from "@/features/auth/infrastructure/model/login/refresh-token-response";
import { ValidateTokenResponse } from "@/features/auth/infrastructure/model/login/validate-token-response";
import { ResetPasswordResponse } from "@/features/auth/infrastructure/model/reset-password/reset-password-response";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { BaseResponse } from "@/shared/infrastructure/model/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { UpdatePasswordDto } from "@/features/auth/infrastructure/params/auth-dto";
import { UpdatePasswordResponse } from "@/features/auth/infrastructure/model/auth-response";

export interface AuthDataSource {
  login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<BaseResponse<LoginResponse> | BaseErrorResponse>;

  logout(): Promise<void | BaseErrorResponse>;

  refreshToken({
    token,
  }: {
    token: string;
  }): Promise<RefreshTokenResponse | BaseErrorResponse>;

  validateToken({
    token,
  }: {
    token: string;
  }): Promise<ValidateTokenResponse | BaseErrorResponse>;

  resetPassword({
    params,
  }: {
    params: ResetPasswordData;
  }): Promise<ResetPasswordResponse | BaseErrorResponse>;

  resetPassword({
    params,
  }: {
    params: ResetPasswordData;
  }): Promise<ResetPasswordResponse | BaseErrorResponse>;

  updatePassword({
    updatePasswordData,
  }: {
    updatePasswordData: UpdatePasswordDto;
  }): Promise<BaseResponse<UpdatePasswordResponse> | BaseErrorResponse>;
}
