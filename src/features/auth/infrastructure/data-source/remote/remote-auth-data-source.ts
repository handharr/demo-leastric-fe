import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthDataSource } from "@/features/auth/infrastructure/data-source/interface/auth-data-source";
import { LoginResponse } from "@/features/auth/infrastructure/model/login/login-response";
import { RefreshTokenResponse } from "@/features/auth/infrastructure/model/login/refresh-token-response";
import { ValidateTokenResponse } from "@/features/auth/infrastructure/model/login/validate-token-response";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";

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
      return this.handleError(
        error as AxiosError,
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
      return this.handleError(
        error as AxiosError,
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
      return this.handleError(
        error as AxiosError,
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
      return this.handleError(
        error as AxiosError,
        "VALIDATE_TOKEN_ERROR",
        "Failed to validate token"
      );
    }
  }

  private handleError(
    error: AxiosError,
    code: string,
    defaultMessage: string
  ): BaseErrorModel {
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const serverMessage = (error.response.data as string) || defaultMessage;

      return createErrorModel(code, serverMessage, error.message, statusCode);
    } else if (error.request) {
      // Network error
      return createErrorModel(
        "NETWORK_ERROR",
        "Network connection failed",
        error.message
      );
    } else {
      // Other error
      return createErrorModel(code, defaultMessage, error.message);
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
