import { UserModel } from "@/features/users/domain/entities/user/user-model";
import { UserRepository } from "@/features/users/domain/repositories/user-repository";
import { GetAllUsersQueryParam } from "@/features/users/domain/params/query-params/get-all-user-query-param";

export class GetAllUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(queryParams?: GetAllUsersQueryParam): Promise<UserModel[]> {
    return this.userRepository.findAll(queryParams);
  }
}
