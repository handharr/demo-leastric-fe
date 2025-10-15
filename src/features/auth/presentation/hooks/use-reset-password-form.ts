import { useState, useMemo, useCallback } from "react";
import { ResetPasswordPageModel } from "@/features/auth/presentation/page-model/reset-password-page-model";
import { ResetPasswordValidationErrors } from "@/features/auth/domain/entities/reset-password-validation-errors";
import { ResetPasswordUseCase } from "@/features/auth/domain/use-cases/reset-password-use-case";
import { ResetPasswordValidator } from "@/features/auth/presentation/validation/reset-password-validator";
import { AuthRepositoryImpl } from "@/features/auth/infrastructure/repositories-implementation/auth-repository-impl";
import { RemoteAuthDataSource } from "@/features/auth/infrastructure/data-source/remote/remote-auth-data-source";
import { isErrorModel } from "@/core/domain/entities/base-error-model";
import { ErrorType } from "@/core/domain/enums/base-enum";
import { Logger } from "@/core/utils/logger/logger";

export interface UseResetPasswordFormReturn {
  formData: ResetPasswordPageModel;
  errors: ResetPasswordValidationErrors;
  isLoading: boolean;
  isSuccess: boolean;
  updateField: (field: keyof ResetPasswordPageModel, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: (field: keyof ResetPasswordValidationErrors) => void;
  getPasswordRequirements: (password: string) => {
    minLength: boolean;
    hasCapital: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function useResetPasswordForm(): UseResetPasswordFormReturn {
  const [formData, setFormData] = useState<ResetPasswordPageModel>({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ResetPasswordValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPasswordUseCase = useMemo(
    () =>
      new ResetPasswordUseCase(
        new AuthRepositoryImpl(new RemoteAuthDataSource())
      ),
    [] // Empty dependency array = create only once
  );

  const updateField = useCallback(
    (field: keyof ResetPasswordPageModel, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors] // Recreate only when errors change
  );

  const clearError = useCallback(
    (field: keyof ResetPasswordValidationErrors) => {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [] // No dependencies = same function reference always
  );

  const getPasswordRequirements = useCallback(
    (password: string) => {
      return ResetPasswordValidator.getPasswordRequirements(password);
    },
    [] // Pure function = no dependencies needed
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrors({});

      try {
        const validationErrors = ResetPasswordValidator.validate(formData);

        if (ResetPasswordValidator.hasErrors(validationErrors)) {
          setErrors(validationErrors);
          return;
        }

        const result = await resetPasswordUseCase.execute({
          newPassword: formData.newPassword,
        });

        if (isErrorModel(result)) {
          if (result.type === ErrorType.VALIDATION) {
            try {
              const newPasswordErrors = result.validationErrors?.newPassword;
              const confirmPasswordErrors =
                result.validationErrors?.confirmPassword;
              const otherErrors = result.validationErrors?.other;
              setErrors({
                newPassword: newPasswordErrors,
                confirmPassword: confirmPasswordErrors,
                other: otherErrors,
              });
            } catch {
              setErrors({
                other: result.message,
              });
            }
          } else {
            setErrors({
              other: result.message,
            });
          }
        } else {
          setIsSuccess(true);
        }
      } catch (error) {
        Logger.error(
          "useResetPasswordForm",
          "Unexpected error during password reset:",
          error
        );
        setErrors({
          newPassword: "An unexpected error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, resetPasswordUseCase] // Recreate when formData or useCase changes
  );

  return {
    formData,
    errors,
    isLoading,
    isSuccess,
    updateField,
    handleSubmit,
    clearError,
    getPasswordRequirements,
  };
}
