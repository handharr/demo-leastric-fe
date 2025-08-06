import { LoginValidationErrors } from "@/features/auth/domain/entities/login-validation-errors";
import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";

export class LoginValidator {
  static validate(data: LoginFormData): LoginValidationErrors {
    const errors: LoginValidationErrors = {};

    // Email validation
    if (!data.email) {
      errors.email = "Email is required";
    } else if (!this.isValidEmail(data.email)) {
      errors.email = "Invalid email";
    }

    // Password validation
    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Invalid password";
    }

    return errors;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static hasErrors(errors: LoginValidationErrors): boolean {
    return Object.keys(errors).length > 0;
  }
}
