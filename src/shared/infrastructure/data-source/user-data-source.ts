import { BaseResponse } from "@/core/insfrastructure/responses/base-response";
import { BaseErrorResponse } from "@/core/insfrastructure/responses/base-error-response";
import { UpdateUserDto } from "@/shared/infrastructure/params/dto";
import { GetUserResponse } from "@/shared/infrastructure/responses/user-response";

export interface UserDataSource {
  getUserDetails(): Promise<BaseResponse<GetUserResponse> | BaseErrorResponse>;

  updateUserDetails({
    userData,
  }: {
    userData: UpdateUserDto;
  }): Promise<BaseResponse<unknown> | BaseErrorResponse>;
}
