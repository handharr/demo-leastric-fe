import { useState, useCallback, useMemo } from "react";
import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";
import { LoginValidationErrors } from "@/features/auth/domain/entities/login-validation-errors";
import { LoginUseCase } from "@/features/auth/domain/use-cases/login-use-case";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import router from "next/router";

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

  const updateField = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      setErrors((prev) => {
        if (prev[field]) {
          return { ...prev, [field]: undefined };
        }
        return prev;
      });
    },
    []
  );

  const clearError = useCallback((field: keyof LoginValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrors({});

      try {
        const result = await loginUseCase.execute(formData);

        if (isErrorModel(result)) {
          // Handle different error types
          if (result.type === "VALIDATION") {
            // Parse validation errors from details
            try {
              const emailError = result.validationErrors?.email;
              const passwordError = result.validationErrors?.password;
              const otherError = result.validationErrors?.other;
              const validationErrors: LoginValidationErrors = {
                email: emailError,
                password: passwordError,
                other: otherError,
              };
              setErrors(validationErrors);
            } catch {
              // Fallback if parsing fails
              console.error("Failed to parse validation errors:", result);
              setErrors({
                other: result.message,
              });
            }
          } else {
            // Handle other errors (network, server, etc.)
            setErrors({
              other: result.message,
            });
          }
        } else {
          // Handle successful login (redirect, etc.)
          console.log("Login successful:", result);
          // You can add redirect logic here or emit an event
          router.push("/dashboard");
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
    },
    [formData, loginUseCase]
  );

  const returnValue = useMemo(
    () => ({
      formData,
      errors,
      isLoading,
      updateField,
      handleSubmit,
      clearError,
    }),
    [formData, errors, isLoading, updateField, handleSubmit, clearError]
  );

  return returnValue;
}
