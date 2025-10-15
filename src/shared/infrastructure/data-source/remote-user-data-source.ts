import { BaseResponse } from "@/core/insfrastructure/responses/base-response";
import {
  ApiClient,
  createAuthApiClient,
} from "@/core/insfrastructure/api/api-client";
import { BaseErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import { UpdateUserDto } from "@/shared/infrastructure/params/dto";
import { UserDataSource } from "@/shared/infrastructure/data-source/user-data-source";
import { GetUserResponse } from "@/shared/infrastructure/responses/user-response";

export class RemoteUserDataSource implements UserDataSource {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient, onAuthFailure?: () => void) {
    this.apiClient = apiClient || createAuthApiClient();

    // Set custom auth failure handler if provided
    if (onAuthFailure) {
      this.apiClient.setAuthFailureHandler(onAuthFailure);
    }
  }

  getUserDetails(): Promise<BaseResponse<GetUserResponse> | BaseErrorResponse> {
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
