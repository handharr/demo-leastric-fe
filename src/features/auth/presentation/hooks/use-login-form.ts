import { useState } from "react";
import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";
import { LoginValidationErrors } from "@/features/auth/domain/entities/login-validation-errors";
import { LoginUseCase } from "@/features/auth/domain/use-cases/login-use-case";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";

export interface UseLoginFormReturn {
  formData: LoginFormData;
  errors: LoginValidationErrors;
  isLoading: boolean;
  updateField: (field: keyof LoginFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: (field: keyof LoginValidationErrors) => void;
}

export function useLoginForm(
  loginUseCase: LoginUseCase = new LoginUseCase()
): UseLoginFormReturn {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const clearError = (field: keyof LoginValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await loginUseCase.execute(formData);

      if (isErrorModel(result)) {
        // Handle different error types
        if (result.code === "VALIDATION_ERROR") {
          // Parse validation errors from details
          try {
            const validationErrors = JSON.parse(result.details || "");
            console.error("set Validation errors:", validationErrors);
            setErrors(validationErrors);
          } catch {
            // Fallback if parsing fails
            console.error("Failed to parse validation errors:", result);
            setErrors({
              email: result.message,
              password: result.message,
            });
          }
        } else {
          // Handle other errors (network, server, etc.)
          setErrors({
            email: result.message,
            password: result.message,
          });
        }
      } else if (result.success) {
        // Handle successful login (redirect, etc.)
        console.log("Login successful:", result);
        // You can add redirect logic here or emit an event
        // Example: router.push('/dashboard');
      } else {
        // Handle case where result is not success but not an error model
        setErrors({
          email: "Login failed",
          password: "Login failed",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        email: "An unexpected error occurred",
        password: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    updateField,
    handleSubmit,
    clearError,
  };
}
