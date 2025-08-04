import { UserModel } from "@/features/users/domain/entities/user/user-model";
import { UserRepository } from "@/features/users/domain/repositories/user-repository";
import { UpdateUserPathParam } from "@/features/users/domain/params/path-params/update-user-path-param";
import { UpdateUserQueryParam } from "@/features/users/domain/params/query-params/update-user-query-param";

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    pathParams?: UpdateUserPathParam,
    requestParams?: Partial<UserModel>,
    queryParams?: UpdateUserQueryParam
  ): Promise<UserModel> {
    return this.userRepository.update(pathParams, requestParams, queryParams);
  }
}
