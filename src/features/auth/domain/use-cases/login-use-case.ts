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
import { UserModel } from "@/features/auth/domain/entities/user-model";

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
      return createErrorModel(
        "VALIDATION_ERROR",
        "Form validation failed",
        JSON.stringify(validationErrors) // Pass validation errors as JSON string
      );
    }

    try {
      const result = await this.authRepository.login(formData);

      if (isErrorModel(result)) {
        return result;
      }

      return result;
    } catch (error) {
      console.error("Login failed:", error);
      return createErrorModel(
        "UNEXPECTED_ERROR",
        "An unexpected error occurred during login",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
