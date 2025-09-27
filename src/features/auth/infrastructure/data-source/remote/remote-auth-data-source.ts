import { AxiosError } from "axios";
import { AuthDataSource } from "@/features/auth/infrastructure/data-source/interface/auth-data-source";
import { LoginResponse } from "@/features/auth/infrastructure/models/login/login-response";
import { RefreshTokenResponse } from "@/features/auth/infrastructure/models/login/refresh-token-response";
import { ValidateTokenResponse } from "@/features/auth/infrastructure/models/login/validate-token-response";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { ResetPasswordResponse } from "@/features/auth/infrastructure/models/reset-password/reset-password-response";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { BaseResponse } from "@/shared/infrastructure/models/base-response";
import {
  ApiClient,
  createAuthApiClient,
} from "@/shared/infrastructure/api/api-client";
import {
  LogoutResponse,
  UpdatePasswordResponse,
} from "@/features/auth/infrastructure/models/auth-response";
import { UpdatePasswordDto } from "@/features/auth/infrastructure/params/auth-dto";
import { Logger } from "@/shared/utils/logger/logger";

export class RemoteAuthDataSource implements AuthDataSource {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient, onAuthFailure?: () => void) {
    this.apiClient = apiClient || createAuthApiClient();

    // Set custom auth failure handler if provided
    if (onAuthFailure) {
      this.apiClient.setAuthFailureHandler(onAuthFailure);
    }
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<BaseResponse<LoginResponse> | BaseErrorResponse> {
    try {
      Logger.info(`Login request to url ${this.apiClient.instance.defaults.baseURL} with data ${email} and ${password}`);
      return await this.apiClient.post<BaseResponse<LoginResponse>>(
        "/v1/login",
        {
          email,
          password,
        }
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Login failed. Please try again."
      );
    }
  }

  async logout(): Promise<BaseResponse<LogoutResponse> | BaseErrorResponse> {
    try {
      return await this.apiClient.post<BaseResponse<LogoutResponse>>(
        "/v1/logout"
      );
    } catch (error) {
      console.error("Logout error:", error);
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Logout failed. Your session has been cleared locally."
      );
    }
  }

  async refreshToken({
    token,
  }: {
    token: string;
  }): Promise<RefreshTokenResponse | BaseErrorResponse> {
    try {
      // Use instance directly to avoid retry logic for refresh tokens
      const response = await this.apiClient.instance.post<RefreshTokenResponse>(
        "/auth/refresh",
        {
          token,
        }
      );
      return response.data;
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Token refresh failed. Please login again."
      );
    }
  }

  async validateToken({
    token,
  }: {
    token: string;
  }): Promise<ValidateTokenResponse | BaseErrorResponse> {
    try {
      return await this.apiClient.post<ValidateTokenResponse>(
        "/auth/validate",
        {
          token,
        }
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Token validation failed. Please login again."
      );
    }
  }

  async resetPassword({
    params,
  }: {
    params: ResetPasswordData;
  }): Promise<ResetPasswordResponse | BaseErrorResponse> {
    try {
      return await this.apiClient.post<ResetPasswordResponse>(
        "/auth/reset-password",
        {
          newPassword: params.newPassword,
        }
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Password reset failed. Please try again."
      );
    }
  }

  async updatePassword({
    updatePasswordData,
  }: {
    updatePasswordData: UpdatePasswordDto;
  }): Promise<BaseResponse<UpdatePasswordResponse> | BaseErrorResponse> {
    try {
      return await this.apiClient.post<BaseResponse<UpdatePasswordResponse>>(
        "/v1/update-password",
        updatePasswordData
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Password update failed. Please try again."
      );
    }
  }
}
