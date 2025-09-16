import { BaseResponse } from "@/shared/infrastructure/models/base-response";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { UpdateUserDto } from "@/shared/infrastructure/params/dto";
import { GetUserResponse } from "@/shared/infrastructure/models/user-response";

export interface UserDataSource {
  getUserDetails(): Promise<BaseResponse<GetUserResponse> | BaseErrorResponse>;

  updateUserDetails({
    userData,
  }: {
    userData: UpdateUserDto;
  }): Promise<BaseResponse<unknown> | BaseErrorResponse>;
}
