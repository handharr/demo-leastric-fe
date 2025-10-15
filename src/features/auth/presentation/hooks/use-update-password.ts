import { useCallback, useState } from "react";
import { UpdatePasswordUseCase } from "@/features/auth/domain/use-cases/update-password-use-case";
import { UpdatePasswordFormData } from "@/features/auth/domain/params/data/auth-form-data";
import { UpdatePasswordModel } from "@/features/auth/domain/entities/auth-model";
import {
  BaseErrorModel,
  createErrorModel,
  isErrorModel,
} from "@/core/domain/entities/base-error-model";

interface UseUpdatePasswordReturn {
  data: UpdatePasswordModel | null;
  error: BaseErrorModel | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  updatePassword: (formData: UpdatePasswordFormData) => Promise<void>;
  reset: () => void;
}

export const useUpdatePassword = (): UseUpdatePasswordReturn => {
  const [data, setData] = useState<UpdatePasswordModel | null>(null);
  const [error, setError] = useState<BaseErrorModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updatePassword = useCallback(
    async (formData: UpdatePasswordFormData): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const updatePasswordUseCase = new UpdatePasswordUseCase();
        const result = await updatePasswordUseCase.execute(formData);

        if (isErrorModel(result)) {
          // It's a BaseErrorModel
          setError(result);
          setData(null);
        } else {
          // It's a UpdatePasswordModel
          setData(result);
          setError(null);
        }
      } catch (err) {
        const errorModel = createErrorModel({
          message: "An unexpected error occurred",
          details: err instanceof Error ? err.message : String(err),
        });
        setError(errorModel);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const isSuccess = !isLoading && !error && data !== null;
  const isError = !isLoading && error !== null;

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    updatePassword,
    reset,
  };
};
