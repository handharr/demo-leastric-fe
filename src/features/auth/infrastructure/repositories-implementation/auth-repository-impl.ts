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
} from "@/core/domain/entities/base-error-model";
import { UserModel } from "@/shared/domain/entities/user-model";
import { isErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import { ErrorType } from "@/core/domain/enums/base-enum";
import { UpdatePasswordModel } from "@/features/auth/domain/entities/auth-model";
import { mapUpdatePasswordFormDataToDto } from "@/features/auth/domain/mapper/auth-params-mapper";
import { UpdatePasswordFormData } from "@/features/auth/domain/params/data/auth-form-data";
import { RemoteAuthDataSource } from "@/features/auth/infrastructure/data-source/remote/remote-auth-data-source";
import { AuthHelper } from "@/features/auth/domain/utils/auth-helper";
import { Logger } from "@/core/utils/logger/logger";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private dataSource: AuthDataSource = new RemoteAuthDataSource()
  ) {}

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
    Logger.info("result", result);

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
        AuthHelper.setAuthTokens({
          authToken: result.data.tokens.access_token,
          refreshToken: result.data.tokens.refresh_token,
        });
      }

      return {
        id: optionalValue(result.data.user?.id).orZero(),
        email: optionalValue(result.data.user?.email).orEmpty(),
        name: optionalValue(result.data.user?.name).orEmpty(),
        phoneNumber: optionalValue(result.data.user?.phoneNumber).orEmpty(),
        createdAt: optionalValue(result.data.user?.createdAt).orEmpty(),
        updatedAt: optionalValue(result.data.user?.updatedAt).orEmpty(),
      } as UserModel;
    } else {
      return createErrorModel({
        message: "Invalid credentials",
        details: optionalValue(result.flash?.message).orDefault(
          "Authentication failed"
        ),
        type: ErrorType.AUTHENTICATION,
      });
    }
  }

  async logout(): Promise<boolean | BaseErrorModel> {
    const result = await this.dataSource.logout();

    if (isErrorResponse(result)) {
      // Convert BaseErrorResponse to BaseErrorModel
      const errorModel = mapErrorResponseToModel({ response: result });
      return errorModel;
    }

    return result.flash?.type === "success";
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
        AuthHelper.setAuthTokens({
          authToken: result.token,
        });
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

    return optionalValue(result.valid).orFalse();
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
      success: optionalValue(result.success).orFalse(),
      message: optionalValue(result.message).orEmpty(),
    } as ResetPasswordModel;
  }

  async updatePassword({
    formData,
  }: {
    formData: UpdatePasswordFormData;
  }): Promise<UpdatePasswordModel | BaseErrorModel> {
    const dto = mapUpdatePasswordFormDataToDto(formData);
    const result = await this.dataSource.updatePassword({
      updatePasswordData: dto,
    });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    return {
      success: result.flash?.type === "success",
      message: optionalValue(result.data?.message).orEmpty(),
    } as UpdatePasswordModel;
  }
}
