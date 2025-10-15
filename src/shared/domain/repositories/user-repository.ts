import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { UpdateUserFormData } from "@/shared/domain/params/data-params";
import { UserModel } from "@/shared/domain/entities/user-model";

export interface UserRepository {
  getUserDetails(): Promise<UserModel | BaseErrorModel>;
  updateUserDetails(
    userData: UpdateUserFormData
  ): Promise<boolean | BaseErrorModel>;
}
