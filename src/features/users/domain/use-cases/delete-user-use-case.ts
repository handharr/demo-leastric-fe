import { UserRepository } from "@/features/users/domain/repositories/user-repository";
import { DeleteUserPathParam } from "@/features/users/domain/params/path-params/delete-user-path-param";
import { DeleteUserQueryParam } from "@/features/users/domain/params/query-params/delete-user-query-param";

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    pathParams?: DeleteUserPathParam,
    queryParams?: DeleteUserQueryParam
  ): Promise<void> {
    return this.userRepository.delete(pathParams, queryParams);
  }
}
