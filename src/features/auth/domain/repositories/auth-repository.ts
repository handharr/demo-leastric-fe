import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";
import { LoginResultModel } from "@/features/auth/domain/entities/login-result-model";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";

export interface AuthRepository {
  login(data: LoginFormData): Promise<LoginResultModel | BaseErrorModel>;
  logout(): Promise<void | BaseErrorModel>;
  refreshToken(token: string): Promise<LoginResultModel | BaseErrorModel>;
  validateToken(token: string): Promise<boolean>;
}
