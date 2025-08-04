import { LoginResponse } from "@/features/auth/infrastructure/model/login/login-response";
import { RefreshTokenResponse } from "@/features/auth/infrastructure/model/login/refresh-token-response";
import { ValidateTokenResponse } from "@/features/auth/infrastructure/model/login/validate-token-response";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";

export interface AuthDataSource {
  login(
    email: string,
    password: string
  ): Promise<LoginResponse | BaseErrorModel>;
  logout(): Promise<void | BaseErrorModel>;
  refreshToken(token: string): Promise<RefreshTokenResponse | BaseErrorModel>;
  validateToken(token: string): Promise<ValidateTokenResponse | BaseErrorModel>;
}
