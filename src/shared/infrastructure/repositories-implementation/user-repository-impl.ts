import {
  BaseErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { UpdateUserFormData } from "@/shared/domain/params/data-params";
import { mapUpdateUserFormDataToDto } from "@/shared/domain/mapper/params-mapper";
import { UserModel } from "@/shared/domain/entities/user-model";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { UserRepository } from "@/shared/domain/repositories/user-repository";
import { UserDataSource } from "@/shared/infrastructure/data-source/user-data-source";
import { RemoteUserDataSource } from "@/shared/infrastructure/data-source/remote-user-data-source";
import { Logger } from "@/shared/utils/logger/logger";

export class UserRepositoryImpl implements UserRepository {
  constructor(
    private dataSource: UserDataSource = new RemoteUserDataSource()
  ) {}

  async getUserDetails(): Promise<UserModel | BaseErrorModel> {
    const result = await this.dataSource.getUserDetails();

    Logger.info("UserRepositoryImpl", "Retrieved user details:", result);

    if (isErrorResponse(result)) {
      Logger.error(
        "UserRepositoryImpl",
        "Error retrieving user details:",
        result
      );
      return mapErrorResponseToModel({ response: result });
    }

    return {
      id: optionalValue(result.data?.user?.id).orZero(),
      email: optionalValue(result.data?.user?.email).orEmpty(),
      name: optionalValue(result.data?.user?.name).orEmpty(),
      phoneNumber: optionalValue(result.data?.user?.phoneNumber).orEmpty(),
      createdAt: optionalValue(result.data?.user?.createdAt).orEmpty(),
      updatedAt: optionalValue(result.data?.user?.updatedAt).orEmpty(),
    };
  }

  async updateUserDetails(
    userData: UpdateUserFormData
  ): Promise<boolean | BaseErrorModel> {
    const dto = mapUpdateUserFormDataToDto(userData);
    const result = await this.dataSource.updateUserDetails({ userData: dto });

    Logger.info("UserRepositoryImpl", "Updated user details:", result);

    if (isErrorResponse(result)) {
      Logger.error(
        "UserRepositoryImpl",
        "Error updating user details:",
        result
      );
      return mapErrorResponseToModel({ response: result });
    }

    return result.flash?.type === "success";
  }
}
