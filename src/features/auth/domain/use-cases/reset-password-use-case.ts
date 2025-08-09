import { AuthRepository } from "@/features/auth/domain/repositories/auth-repository";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { ResetPasswordModel } from "@/features/auth/domain/entities/reset-password-model";
import { ResetPasswordValidator } from "@/features/auth/presentation/validation/reset-password-validator";
import { ResetPasswordPageModel } from "@/features/auth/presentation/page-model/reset-password-page-model";
import {
  BaseErrorModel,
  createErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { mapValidationErrorsToRecord } from "@/shared/utils/helpers/validation-helpers";

export class ResetPasswordUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(
    params: ResetPasswordData
  ): Promise<ResetPasswordModel | BaseErrorModel> {
    // Use existing validator for comprehensive validation
    const pageModel: ResetPasswordPageModel = {
      newPassword: params.newPassword,
      confirmPassword: params.newPassword, // For use case, we assume they match
    };

    const validationErrors = ResetPasswordValidator.validate(pageModel);

    if (ResetPasswordValidator.hasErrors(validationErrors)) {
      return createErrorModel({
        message: "Password validation failed",
        type: "VALIDATION",
        validationErrors: mapValidationErrorsToRecord(validationErrors),
      });
    }

    try {
      const result = await this.authRepository.resetPassword({ params });

      if (isErrorModel(result)) {
        return result;
      }

      return result;
    } catch (error) {
      console.error("Reset password failed:", error);
      return createErrorModel({
        message: "Password reset failed",
        details: error instanceof Error ? error.message : "Unknown error",
        type: "UNEXPECTED",
      });
    }
  }
}
