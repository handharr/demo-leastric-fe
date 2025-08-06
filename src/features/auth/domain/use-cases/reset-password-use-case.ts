import { AuthRepository } from "@/features/auth/domain/repositories/auth-repository";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { ResetPasswordResponse } from "@/features/auth/infrastructure/model/reset-password/reset-password-response";
import {
  BaseErrorModel,
  createErrorModel,
} from "@/shared/domain/entities/base-error-model";

export class ResetPasswordUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(
    params: ResetPasswordData
  ): Promise<ResetPasswordResponse | BaseErrorModel> {
    // Add any validation logic here if needed
    if (!params.newPassword || params.newPassword.trim().length === 0) {
      return createErrorModel(
        "VALIDATION_ERROR",
        "New password is required",
        "The new password field cannot be empty"
      );
    }

    return await this.authRepository.resetPassword(params);
  }
}
