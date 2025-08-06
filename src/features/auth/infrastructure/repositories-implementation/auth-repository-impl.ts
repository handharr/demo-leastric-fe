import { AuthRepository } from "@/features/auth/domain/repositories/auth-repository";
import { AuthDataSource } from "@/features/auth/infrastructure/data-source/interface/auth-data-source";
import { LoginResultModel } from "@/features/auth/domain/entities/login-result-model";
import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { ResetPasswordModel } from "@/features/auth/domain/entities/reset-password-model";
import {
  BaseErrorModel,
  isErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private dataSource: AuthDataSource) {}

  async login(data: LoginFormData): Promise<LoginResultModel | BaseErrorModel> {
    if (!data.email || !data.password) {
      return createErrorModel(
        "VALIDATION_ERROR",
        "Email and password are required",
        "Missing required fields"
      );
    }

    const result = await this.dataSource.login(data.email, data.password);

    if (isErrorModel(result)) {
      return result;
    }

    if (result.success && result.token) {
      // Store token in localStorage/sessionStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", result.token);
      }

      return {
        success: true,
        token: result.token,
        user: result.user,
      } as LoginResultModel;
    } else {
      return createErrorModel(
        "LOGIN_FAILED",
        "Invalid credentials",
        result.message || "Authentication failed"
      );
    }
  }

  async logout(): Promise<void | BaseErrorModel> {
    const result = await this.dataSource.logout();

    if (isErrorModel(result)) {
      // Still clear local tokens even if API call fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      }
      return result;
    }

    // Clear local tokens on successful logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
    }
  }

  async refreshToken(
    token: string
  ): Promise<LoginResultModel | BaseErrorModel> {
    if (!token) {
      return createErrorModel(
        "VALIDATION_ERROR",
        "Token is required",
        "Missing token parameter"
      );
    }

    const result = await this.dataSource.refreshToken(token);

    if (isErrorModel(result)) {
      return result;
    }

    if (result.success && result.token) {
      // Update stored token
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", result.token);
      }

      return {
        success: true,
        token: result.token,
      } as LoginResultModel;
    } else {
      return createErrorModel(
        "REFRESH_FAILED",
        "Token refresh failed",
        result.message || "Failed to refresh authentication token"
      );
    }
  }

  async validateToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    const result = await this.dataSource.validateToken(token);

    if (isErrorModel(result)) {
      return false;
    }

    return optional(result.valid).orFalse();
  }

  async resetPassword(
    params: ResetPasswordData
  ): Promise<ResetPasswordModel | BaseErrorModel> {
    const result = await this.dataSource.resetPassword(params);

    if (isErrorModel(result)) {
      return result;
    }

    return {
      success: optional(result.success).orFalse(),
      message: optional(result.message).orEmpty(),
    } as ResetPasswordModel;
  }
}
