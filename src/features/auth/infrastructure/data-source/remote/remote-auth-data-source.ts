import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthDataSource } from "@/features/auth/infrastructure/data-source/interface/auth-data-source";
import { LoginResponse } from "@/features/auth/infrastructure/model/login/login-response";
import { RefreshTokenResponse } from "@/features/auth/infrastructure/model/login/refresh-token-response";
import { ValidateTokenResponse } from "@/features/auth/infrastructure/model/login/validate-token-response";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { AxiosErrorHandler } from "@/shared/utils/error-handler/axios-error-handler";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { ResetPasswordResponse } from "@/features/auth/infrastructure/model/reset-password/reset-password-response";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";

export class RemoteAuthDataSource implements AuthDataSource {
  private readonly baseURL: string;
  private readonly timeout: number = 10000;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:3001/api"
  ) {
    this.baseURL = baseURL;
  }

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse | BaseErrorModel> {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${this.baseURL}/auth/login`,
        {
          email,
          password,
        },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return AxiosErrorHandler.handleErrorResponse<BaseErrorResponse>(
        error as AxiosError<BaseErrorResponse>,
        "LOGIN_ERROR",
        "Failed to login"
      );
    }
  }

  async logout(): Promise<void | BaseErrorModel> {
    try {
      await axios.post(
        `${this.baseURL}/auth/logout`,
        {},
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            Authorization: this.getAuthToken(),
          },
        }
      );

      // Clear local storage or any stored tokens
      this.clearLocalTokens();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local tokens
      this.clearLocalTokens();
      return AxiosErrorHandler.handleErrorResponse<BaseErrorResponse>(
        error as AxiosError<BaseErrorResponse>,
        "LOGOUT_ERROR",
        "Failed to logout"
      );
    }
  }

  async refreshToken(
    token: string
  ): Promise<RefreshTokenResponse | BaseErrorModel> {
    try {
      const response: AxiosResponse<RefreshTokenResponse> = await axios.post(
        `${this.baseURL}/auth/refresh`,
        {
          token,
        },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return AxiosErrorHandler.handleErrorResponse<BaseErrorResponse>(
        error as AxiosError<BaseErrorResponse>,
        "REFRESH_TOKEN_ERROR",
        "Failed to refresh token"
      );
    }
  }

  async validateToken(
    token: string
  ): Promise<ValidateTokenResponse | BaseErrorModel> {
    try {
      const response: AxiosResponse<ValidateTokenResponse> = await axios.post(
        `${this.baseURL}/auth/validate`,
        {
          token,
        },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return AxiosErrorHandler.handleErrorResponse<BaseErrorResponse>(
        error as AxiosError<BaseErrorResponse>,
        "VALIDATE_TOKEN_ERROR",
        "Failed to validate token"
      );
    }
  }

  async resetPassword(
    params: ResetPasswordData
  ): Promise<ResetPasswordResponse | BaseErrorModel> {
    try {
      const response: AxiosResponse<ResetPasswordResponse> = await axios.post(
        `${this.baseURL}/auth/reset-password`,
        {
          newPassword: params.newPassword,
        },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return AxiosErrorHandler.handleErrorResponse<BaseErrorResponse>(
        error as AxiosError<BaseErrorResponse>,
        "RESET_PASSWORD_ERROR",
        "Failed to reset password"
      );
    }
  }

  private getAuthToken(): string {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken") ||
        ""
      );
    }
    return "";
  }

  private clearLocalTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
    }
  }
}
