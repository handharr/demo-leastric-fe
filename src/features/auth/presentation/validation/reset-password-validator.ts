import { ResetPasswordValidationErrors } from "@/features/auth/domain/entities/reset-password-validation-errors";
import { ResetPasswordPageModel } from "@/features/auth/presentation/page-model/reset-password-page-model";

export class ResetPasswordValidator {
  static validate(data: ResetPasswordPageModel): ResetPasswordValidationErrors {
    const errors: ResetPasswordValidationErrors = {};

    // New password validation
    if (!data.newPassword) {
      errors.newPassword = "New password is required";
    } else if (data.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(data.newPassword)) {
      errors.newPassword = "Password must include capital letter";
    } else if (!/[0-9]/.test(data.newPassword)) {
      errors.newPassword = "Password must include number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword)) {
      errors.newPassword = "Password must include special character";
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    return errors;
  }

  static hasErrors(errors: ResetPasswordValidationErrors): boolean {
    return Object.keys(errors).length > 0;
  }

  static getPasswordRequirements(password: string) {
    return {
      minLength: password.length >= 8,
      hasCapital: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }
}
