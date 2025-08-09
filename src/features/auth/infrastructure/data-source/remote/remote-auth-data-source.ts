import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthDataSource } from "@/features/auth/infrastructure/data-source/interface/auth-data-source";
import { LoginResponse } from "@/features/auth/infrastructure/model/login/login-response";
import { RefreshTokenResponse } from "@/features/auth/infrastructure/model/login/refresh-token-response";
import { ValidateTokenResponse } from "@/features/auth/infrastructure/model/login/validate-token-response";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { ResetPasswordResponse } from "@/features/auth/infrastructure/model/reset-password/reset-password-response";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { BaseResponse } from "@/shared/infrastructure/model/base-response";
import {
  getAuthToken,
  clearLocalTokens,
  handleErrorResponse,
} from "@/shared/utils/helpers/network-helper";

export class RemoteAuthDataSource implements AuthDataSource {
  private readonly baseURL: string;
  private readonly timeout: number = 10000;
  private readonly axiosInstance;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:3001/api"
  ) {
    this.baseURL = baseURL;

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<BaseResponse<LoginResponse> | BaseErrorResponse> {
    try {
      const response: AxiosResponse<BaseResponse<LoginResponse>> =
        await this.axiosInstance.post("/v1/login", {
          email,
          password,
        });

      return response.data;
    } catch (error) {
      return handleErrorResponse(
        error as AxiosError<BaseErrorResponse>,
        "LOGIN_ERROR",
        "Login failed. Please try again."
      );
    }
  }

  async logout(): Promise<void | BaseErrorResponse> {
    try {
      await this.axiosInstance.post("/auth/logout");
      clearLocalTokens();
    } catch (error) {
      console.error("Logout error:", error);
      clearLocalTokens(); // Always clear tokens even if API call fails

      return handleErrorResponse(
        error as AxiosError<BaseErrorResponse>,
        "LOGOUT_ERROR",
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
      const response: AxiosResponse<RefreshTokenResponse> =
        await this.axiosInstance.post("/auth/refresh", {
          token,
        });

      return response.data;
    } catch (error) {
      return handleErrorResponse(
        error as AxiosError<BaseErrorResponse>,
        "TOKEN_REFRESH_ERROR",
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
      const response: AxiosResponse<ValidateTokenResponse> =
        await this.axiosInstance.post("/auth/validate", {
          token,
        });

      return response.data;
    } catch (error) {
      return handleErrorResponse(
        error as AxiosError<BaseErrorResponse>,
        "TOKEN_VALIDATION_ERROR",
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
      const response: AxiosResponse<ResetPasswordResponse> =
        await this.axiosInstance.post("/auth/reset-password", {
          newPassword: params.newPassword,
        });

      return response.data;
    } catch (error) {
      return handleErrorResponse(
        error as AxiosError<BaseErrorResponse>,
        "RESET_PASSWORD_ERROR",
        "Password reset failed. Please try again."
      );
    }
  }
}
