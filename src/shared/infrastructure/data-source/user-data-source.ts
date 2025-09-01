import { BaseResponse } from "@/shared/infrastructure/model/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { UpdateUserDto } from "@/shared/infrastructure/params/dto";
import { UserResponse } from "@/shared/infrastructure/model/user-response";

export interface UserDataSource {
  getUserDetails(): Promise<BaseResponse<UserResponse> | BaseErrorResponse>;

  updateUserDetails({
    userData,
  }: {
    userData: UpdateUserDto;
  }): Promise<BaseResponse<unknown> | BaseErrorResponse>;
}
