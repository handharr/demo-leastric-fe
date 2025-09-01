import { BaseResponse } from "@/shared/infrastructure/model/base-response";
import {
  ApiClient,
  createAuthApiClient,
} from "@/shared/infrastructure/api/api-client";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { UpdateUserDto } from "@/shared/infrastructure/params/dto";
import { UserDataSource } from "@/shared/infrastructure/data-source/user-data-source";
import { UserResponse } from "../model/user-response";

export class RemoteUserDataSource implements UserDataSource {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient, onAuthFailure?: () => void) {
    this.apiClient = apiClient || createAuthApiClient();

    // Set custom auth failure handler if provided
    if (onAuthFailure) {
      this.apiClient.setAuthFailureHandler(onAuthFailure);
    }
  }

  getUserDetails(): Promise<BaseResponse<UserResponse> | BaseErrorResponse> {
    return this.apiClient.get("/v1/me");
  }

  updateUserDetails({
    userData,
  }: {
    userData: UpdateUserDto;
  }): Promise<BaseResponse<unknown> | BaseErrorResponse> {
    return this.apiClient.post("/v1/me", userData);
  }
}
