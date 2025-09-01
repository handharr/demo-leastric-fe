import { useState, useCallback } from "react";
import { UpdateUserDetailsUseCase } from "@/shared/domain/use-cases/update-user-details-use-case";
import { UpdateUserFormData } from "@/shared/domain/params/data-params";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";

export function useUpdateUserDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BaseErrorModel | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const updateUserDetails = useCallback(
    async (userData: UpdateUserFormData) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const useCase = new UpdateUserDetailsUseCase();
      const result = await useCase.execute(userData);

      if (typeof result === "boolean" && result) {
        setSuccess(true);
      } else if (typeof result !== "boolean") {
        setError(result);
        setSuccess(false);
      } else {
        setSuccess(false);
      }
      setLoading(false);
    },
    []
  );

  return {
    updateUserDetails,
    loading,
    error,
    success,
  };
}
