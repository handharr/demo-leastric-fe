import {
  BaseErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { UpdateUserFormData } from "@/shared/domain/params/data-params";
import { mapUpdateUserFormDataToDto } from "@/shared/domain/mapper/params-mapper";
import { UserModel } from "@/shared/domain/entities/user-model";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import { UserRepository } from "@/shared/domain/repositories/user-repository";
import { UserDataSource } from "@/shared/infrastructure/data-source/user-data-source";
import { RemoteUserDataSource } from "@/shared/infrastructure/data-source/remote-user-data-source";

export class UserRepositoryImpl implements UserRepository {
  constructor(
    private dataSource: UserDataSource = new RemoteUserDataSource()
  ) {}

  async getUserDetails(): Promise<UserModel | BaseErrorModel> {
    const result = await this.dataSource.getUserDetails();

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    return {
      id: optional(result.data?.id).orZero(),
      email: optional(result.data?.email).orEmpty(),
      name: optional(result.data?.name).orEmpty(),
      phoneNumber: optional(result.data?.phoneNumber).orEmpty(),
      createdAt: optional(result.data?.createdAt).orEmpty(),
      updatedAt: optional(result.data?.updatedAt).orEmpty(),
    };
  }

  async updateUserDetails(
    userData: UpdateUserFormData
  ): Promise<boolean | BaseErrorModel> {
    const dto = mapUpdateUserFormDataToDto(userData);
    const result = await this.dataSource.updateUserDetails({ userData: dto });

    if (isErrorResponse(result)) {
      return mapErrorResponseToModel({ response: result });
    }

    return result.flash?.type === "success";
  }
}
