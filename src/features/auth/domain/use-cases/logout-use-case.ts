import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { AuthRepository } from "@/features/auth/domain/repositories/auth-repository";
import { AuthRepositoryImpl } from "@/features/auth/infrastructure/repositories-implementation/auth-repository-impl";
import { ErrorType } from "@/shared/domain/enum/base-enum";

export class LogoutUseCase {
  constructor(
    private authRepository: AuthRepository = new AuthRepositoryImpl()
  ) {}

  async execute(): Promise<boolean | BaseErrorModel> {
    try {
      // Call the repository logout method
      const result = await this.authRepository.logout();

      // If logout was successful, clear stored tokens
      if (result === true) {
        return true;
      }

      // Return the error model if logout failed
      return result as BaseErrorModel;
    } catch (error) {
      // Handle any unexpected errors
      return {
        message: "Logout failed",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
        type: ErrorType.UNEXPECTED,
      };
    }
  }
}
