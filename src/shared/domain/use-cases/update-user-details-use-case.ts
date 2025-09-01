import { UserRepository } from "@/shared/domain/repositories/user-repository";
import { UpdateUserFormData } from "@/shared/domain/params/data-params";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { UserRepositoryImpl } from "@/shared/infrastructure/repositories-implementation/user-repository-impl";
import { Logger } from "@/shared/utils/logger/logger";

export class UpdateUserDetailsUseCase {
  constructor(
    private userRepository: UserRepository = new UserRepositoryImpl()
  ) {}

  async execute(
    userData: UpdateUserFormData
  ): Promise<boolean | BaseErrorModel> {
    try {
      const result = await this.userRepository.updateUserDetails(userData);
      Logger.info(
        "UpdateUserDetailsUseCase",
        "Successfully updated user details:",
        result
      );
      return result;
    } catch (error) {
      Logger.error(
        "UpdateUserDetailsUseCase",
        "Error updating user details:",
        error
      );
      return createErrorModel({
        message: "Failed to update user details",
        details: error instanceof Error ? error.message : "Unknown error",
        type: "UNEXPECTED",
      });
    }
  }
}
