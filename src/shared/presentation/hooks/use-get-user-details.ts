import { useCallback, useEffect, useState } from "react";
import { GetUserDetailsUseCase } from "@/shared/domain/use-cases/get-user-details-use-case";
import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { useUser } from "@/shared/presentation/hooks/user-context";
import { UserModel } from "@/shared/domain/entities/user-model";

interface GetUserDetailsResult {
  userDetails: UserModel | null; // Replace 'any' with actual UserModel type if available
  loading: boolean;
  error: BaseErrorModel | null;
  fetchUserDetails: () => Promise<void>;
  reset: () => void;
}

export const useGetUserDetails = (): GetUserDetailsResult => {
  const { user: userDetails, updateUser } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<BaseErrorModel | null>(null);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const getUserDetailsUseCase = new GetUserDetailsUseCase();
      const result = await getUserDetailsUseCase.execute();
      if (isErrorModel(result)) {
        setError(result);
      } else {
        updateUser(result);
      }
    } catch (err) {
      const errorModel = {
        message: "Unexpected error occurred",
        details: err instanceof Error ? err.message : "Unknown error",
        type: ErrorType.UNEXPECTED,
      };
      setError(errorModel);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    // Only fetch if user is not already loaded from storage
    if (!userDetails) {
      fetchUserDetails();
    }
  }, [fetchUserDetails, userDetails]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    userDetails,
    loading,
    error,
    fetchUserDetails,
    reset,
  };
};
