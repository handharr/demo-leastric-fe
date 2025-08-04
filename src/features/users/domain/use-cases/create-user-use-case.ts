import { UserModel } from "@/features/users/domain/entities/user/user-model";
import { UserRepository } from "@/features/users/domain/repositories/user-repository";
import { CreateUserRequestParam } from "@/features/users/domain/params/request-params/create-user-request-param";
import { CreateUserQueryParam } from "@/features/users/domain/params/query-params/create-user-query-param";

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    requestParams?: CreateUserRequestParam,
    queryParams?: CreateUserQueryParam
  ): Promise<UserModel> {
    return this.userRepository.create(requestParams, queryParams);
  }
}
