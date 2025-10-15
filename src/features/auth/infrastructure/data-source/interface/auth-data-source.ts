import { LoginResponse } from "@/features/auth/infrastructure/models/login/login-response";
import { RefreshTokenResponse } from "@/features/auth/infrastructure/models/login/refresh-token-response";
import { ValidateTokenResponse } from "@/features/auth/infrastructure/models/login/validate-token-response";
import { ResetPasswordResponse } from "@/features/auth/infrastructure/models/reset-password/reset-password-response";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { BaseResponse } from "@/core/insfrastructure/responses/base-response";
import { BaseErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import { UpdatePasswordDto } from "@/features/auth/infrastructure/params/auth-dto";
import {
  LogoutResponse,
  UpdatePasswordResponse,
} from "@/features/auth/infrastructure/models/auth-response";

export interface AuthDataSource {
  login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<BaseResponse<LoginResponse> | BaseErrorResponse>;

  logout(): Promise<BaseResponse<LogoutResponse> | BaseErrorResponse>;

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
