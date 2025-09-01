import { UserRepository } from "@/shared/domain/repositories/user-repository";
import { UserModel } from "@/shared/domain/entities/user-model";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";
import { UserRepositoryImpl } from "@/shared/infrastructure/repositories-implementation/user-repository-impl";

export class GetUserDetailsUseCase {
  constructor(
    private userRepository: UserRepository = new UserRepositoryImpl()
  ) {}

  async execute(): Promise<UserModel | BaseErrorModel> {
    try {
      const userDetails = await this.userRepository.getUserDetails();
      Logger.info(
        "GetUserDetailsUseCase",
        "Successfully retrieved user details:",
        userDetails
      );
      return userDetails;
    } catch (error) {
      Logger.error(
        "GetUserDetailsUseCase",
        "Error retrieving user details:",
        error
      );
      return createErrorModel({
        message: "Error retrieving user details",
        details: error instanceof Error ? error.message : "Unknown error",
        type: "UNEXPECTED",
      });
    }
  }
}
