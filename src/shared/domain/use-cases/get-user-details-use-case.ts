import { UserRepository } from "@/shared/domain/repositories/user-repository";
import { UserModel } from "@/shared/domain/entities/user-model";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/core/domain/entities/base-error-model";
import { Logger } from "@/core/utils/logger/logger";
import { UserRepositoryImpl } from "@/shared/infrastructure/repositories-implementation/user-repository-impl";
import { ErrorType } from "@/core/domain/enums/base-enum";
import {
  StorageManager,
  STORAGE_KEYS,
} from "@/core/utils/helpers/storage-helper";

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
      // Store user data in localStorage after successful login
      StorageManager.setItem({
        key: STORAGE_KEYS.USER_DATA,
        value: userDetails,
        options: {
          useSessionStorage: false, // Use localStorage for persistence
        },
      });
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
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
