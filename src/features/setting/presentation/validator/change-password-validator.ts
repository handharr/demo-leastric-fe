export interface PasswordValidationRule {
  id: string;
  label: string;
  message: string;
  validator: (password: string) => boolean;
  isValid: boolean;
}

export interface ChangePasswordValidationError {
  currentPassword?: string;
  newPassword?: string[];
  confirmPassword?: string;
}

export interface ChangePasswordFields {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordValidationResult {
  isValid: boolean;
  errors: ChangePasswordValidationError;
  passwordRules?: PasswordValidationRule[];
}

export const PASSWORD_RULES: PasswordValidationRule[] = [
  {
    id: "min_length",
    label: "At least 8 characters",
    message: "Password must at least 8 character minimal",
    validator: (password: string) => {
      if (!password) return false;
      return password.length >= 8;
    },
    isValid: false,
  },
  {
    id: "capital_letter",
    label: "Must include capital letter",
    message: "Password must include capital letter",
    validator: (password: string) => {
      if (!password) return false;
      return /[A-Z]/.test(password);
    },
    isValid: false,
  },
  {
    id: "number",
    label: "Must include number",
    message: "Password must include Number",
    validator: (password: string) => {
      if (!password) return false;
      return /\d/.test(password);
    },
    isValid: false,
  },
  {
    id: "special_character",
    label: "Must include special character",
    message: "Password must include special character (*, !, @, #, %)",
    validator: (password: string) => {
      if (!password) return false;
      return /[*!@#%]/.test(password);
    },
    isValid: false,
  },
];

export class ChangePasswordValidator {
  static validate(
    fields: ChangePasswordFields
  ): ChangePasswordValidationResult {
    const errors: ChangePasswordValidationError = {};
    const { newPassword, confirmPassword } = fields;

    // Validate new password using rules - only if password is not empty
    const newPasswordErrors: string[] = [];
    const passwordRules = PASSWORD_RULES.map((rule) => ({
      ...rule,
      isValid: rule.validator(newPassword),
    }));

    // Only collect failed validation messages if password is not empty
    if (newPassword && newPassword.trim().length > 0) {
      passwordRules.forEach((rule) => {
        if (!rule.isValid) {
          newPasswordErrors.push(rule.message);
        }
      });

      if (newPasswordErrors.length > 0) {
        errors.newPassword = newPasswordErrors;
      }
    }

    // Validate confirm password - only if both passwords are not empty
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return {
      isValid:
        Object.keys(errors).length === 0 &&
        newPassword.length > 0 &&
        confirmPassword.length > 0,
      errors,
      passwordRules,
    };
  }

  static getPasswordRules(password: string = ""): PasswordValidationRule[] {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      isValid: rule.validator(password),
    }));
  }
}
