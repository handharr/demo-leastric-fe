import { useState } from "react";
import { ResetPasswordPageModel } from "@/features/auth/presentation/page-model/reset-password-page-model";
import { ResetPasswordValidationErrors } from "@/features/auth/domain/entities/reset-password-validation-errors";
import { ResetPasswordUseCase } from "@/features/auth/domain/use-cases/reset-password-use-case";
import { ResetPasswordValidator } from "@/features/auth/presentation/validation/reset-password-validator";
import { AuthRepositoryImpl } from "@/features/auth/infrastructure/repositories-implementation/auth-repository-impl";
import { RemoteAuthDataSource } from "@/features/auth/infrastructure/data-source/remote/remote-auth-data-source";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";

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

  const resetPasswordUseCase = new ResetPasswordUseCase(
    new AuthRepositoryImpl(new RemoteAuthDataSource())
  );

  const updateField = (field: keyof ResetPasswordPageModel, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const clearError = (field: keyof ResetPasswordValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const getPasswordRequirements = (password: string) => {
    return ResetPasswordValidator.getPasswordRequirements(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Client-side validation
      const validationErrors = ResetPasswordValidator.validate(formData);

      if (ResetPasswordValidator.hasErrors(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      const result = await resetPasswordUseCase.execute({
        newPassword: formData.newPassword,
      });

      if (isErrorModel(result)) {
        if (result.code === "VALIDATION_ERROR") {
          try {
            const serverErrors = JSON.parse(result.details || "");
            setErrors(serverErrors);
          } catch {
            setErrors({
              newPassword: result.message,
            });
          }
        } else {
          setErrors({
            newPassword: result.message,
          });
        }
      } else {
        // Success
        setIsSuccess(true);
        console.log("Password reset successful:", result);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setErrors({
        newPassword: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
