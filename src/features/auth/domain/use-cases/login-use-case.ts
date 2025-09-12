import { LoginValidator } from "@/features/auth/presentation/validation/login-validator";
import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";
import { AuthRepository } from "@/features/auth/domain/repositories/auth-repository";
import { AuthRepositoryImpl } from "@/features/auth/infrastructure/repositories-implementation/auth-repository-impl";
import { RemoteAuthDataSource } from "@/features/auth/infrastructure/data-source/remote/remote-auth-data-source";
import {
  BaseErrorModel,
  isErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { UserModel } from "@/shared/domain/entities/user-model";
import { mapValidationErrorsToRecord } from "@/shared/utils/helpers/validation-helpers";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import {
  StorageManager,
  STORAGE_KEYS,
} from "@/shared/utils/helpers/storage-helper";

export class LoginUseCase {
  constructor(
    private authRepository: AuthRepository = new AuthRepositoryImpl(
      new RemoteAuthDataSource()
    )
  ) {}

  async execute(formData: LoginFormData): Promise<UserModel | BaseErrorModel> {
    // Client-side validation
    const validationErrors = LoginValidator.validate(formData);

    if (LoginValidator.hasErrors(validationErrors)) {
      console.error("Validation errors:", validationErrors);

      return createErrorModel({
        message: "Validation failed",
        validationErrors: mapValidationErrorsToRecord(validationErrors),
        type: ErrorType.VALIDATION,
      });
    }

    try {
      const result = await this.authRepository.login({ data: formData });

      if (isErrorModel(result)) {
        return result;
      }

      // Store user data in localStorage after successful login
      StorageManager.setItem({
        key: STORAGE_KEYS.USER_DATA,
        value: result,
        options: {
          useSessionStorage: false, // Use localStorage for persistence
        },
      });

      return result;
    } catch (error) {
      console.error("Login failed:", error);
      return createErrorModel({
        message: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      });
    }
  }
}
