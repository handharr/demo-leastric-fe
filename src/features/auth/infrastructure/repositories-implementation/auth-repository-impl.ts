import { AuthRepository } from "@/features/auth/domain/repositories/auth-repository";
import { AuthDataSource } from "@/features/auth/infrastructure/data-source/interface/auth-data-source";
import { LoginResultModel } from "@/features/auth/domain/entities/login-result-model";
import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { ResetPasswordModel } from "@/features/auth/domain/entities/reset-password-model";
import {
  BaseErrorModel,
  createErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { UserModel } from "@/features/auth/domain/entities/user-model";
import { isErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { storage } from "@/shared/utils/helpers/storage-helper";
import { clearLocalTokens } from "@/shared/utils/helpers/network-helper";
import { ErrorType } from "@/shared/domain/enum/base-enum";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private dataSource: AuthDataSource) {}

  async login({
    data,
  }: {
    data: LoginFormData;
  }): Promise<UserModel | BaseErrorModel> {
    if (!data.email || !data.password) {
      return createErrorModel({
        message: "Email and password are required",
        details: "Missing required fields",
        type: ErrorType.VALIDATION,
      });
    }

    const result = await this.dataSource.login({
      email: data.email,
      password: data.password,
    });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (
      result.flash?.type === "success" &&
      result.data?.tokens?.access_token &&
      result.data?.tokens?.refresh_token
    ) {
      // Store tokens using the new storage system with named parameters
      if (typeof window !== "undefined") {
        storage.setAuthToken({
          token: result.data.tokens.access_token,
        });
        storage.setRefreshToken({
          token: result.data.tokens.refresh_token,
        });
      }

      return {
        id: optional(result.data.user?.id).orZero(),
        email: optional(result.data.user?.email).orEmpty(),
        name: optional(result.data.user?.name).orEmpty(),
        phoneNumber: optional(result.data.user?.phoneNumber).orEmpty(),
        createdAt: optional(result.data.user?.createdAt).orEmpty(),
        updatedAt: optional(result.data.user?.updatedAt).orEmpty(),
      } as UserModel;
    } else {
      return createErrorModel({
        message: "Invalid credentials",
        details: optional(result.flash?.message).orDefault(
          "Authentication failed"
        ),
        type: ErrorType.AUTHENTICATION,
      });
    }
  }

  async logout(): Promise<void | BaseErrorModel> {
    const result = await this.dataSource.logout();

    if (isErrorResponse(result)) {
      // Convert BaseErrorResponse to BaseErrorModel
      const errorModel = mapErrorResponseToModel({ response: result });

      // Still clear local tokens even if API call fails
      if (typeof window !== "undefined") {
        clearLocalTokens();
      }
      return errorModel;
    }

    // Clear local tokens on successful logout
    if (typeof window !== "undefined") {
      clearLocalTokens();
    }
  }

  async refreshToken({
    token,
  }: {
    token: string;
  }): Promise<LoginResultModel | BaseErrorModel> {
    if (!token) {
      return createErrorModel({
        message: "Token is required",
        details: "Missing token parameter",
        type: ErrorType.VALIDATION,
      });
    }

    const result = await this.dataSource.refreshToken({ token });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    if (result.success && result.token) {
      // Update stored token
      if (typeof window !== "undefined") {
        storage.setAuthToken({ token: result.token });
      }

      return {
        success: true,
        token: result.token,
        errors: undefined,
      } as LoginResultModel;
    } else {
      return createErrorModel({
        message: "Token refresh failed",
        details: result.message || "Failed to refresh authentication token",
        type: ErrorType.AUTHENTICATION,
      });
    }
  }

  async validateToken({ token }: { token: string }): Promise<boolean> {
    if (!token) {
      return false;
    }

    const result = await this.dataSource.validateToken({ token });

    if (isErrorResponse(result)) {
      return false;
    }

    return optional(result.valid).orFalse();
  }

  async resetPassword({
    params,
  }: {
    params: ResetPasswordData;
  }): Promise<ResetPasswordModel | BaseErrorModel> {
    if (!params.newPassword) {
      return createErrorModel({
        message: "New password is required",
        details: "Missing newPassword parameter",
        type: ErrorType.VALIDATION,
      });
    }

    const result = await this.dataSource.resetPassword({ params });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    return {
      success: optional(result.success).orFalse(),
      message: optional(result.message).orEmpty(),
    } as ResetPasswordModel;
  }
}
