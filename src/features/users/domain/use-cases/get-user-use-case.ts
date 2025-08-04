import { UserModel } from "@/features/users/domain/entities/user/user-model";
import { UserRepository } from "@/features/users/domain/repositories/user-repository";
import { GetUserPathParam } from "@/features/users/domain/params/path-params/get-user-path-param";
import { GetUserQueryParam } from "@/features/users/domain/params/query-params/get-user-query-param";

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    pathParams?: GetUserPathParam,
    queryParams?: GetUserQueryParam
  ): Promise<UserModel | null> {
    return this.userRepository.findById(pathParams, queryParams);
  }
}
