import { useCallback, useEffect, useState } from "react";
import { GetUserDetailsUseCase } from "@/shared/domain/use-cases/get-user-details-use-case";
import { UserModel } from "@/shared/domain/entities/user-model";
import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";

export const useGetUserDetails = () => {
  const [userDetails, setUserDetails] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
        setUserDetails(result);
      }
    } catch (err) {
      setError({
        message: "Unexpected error occurred",
        details: err instanceof Error ? err.message : "Unknown error",
        type: "UNEXPECTED",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return { userDetails, loading, error };
};
