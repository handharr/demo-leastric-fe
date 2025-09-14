import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogoutUseCase } from "@/features/auth/domain/use-cases/logout-use-case";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";
import { AuthHelper } from "@/features/auth/domain/utils/auth-helper";

interface UseLogoutReturn {
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useLogout = (): UseLogoutReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const logoutUseCase = new LogoutUseCase();
      const result = await logoutUseCase.execute();

      if (result === true) {
        // Logout successful - redirect to login
        AuthHelper.logout({
          clearSessionStorage: true,
          redirect: false,
          callLogoutApi: false,
        });
        router.push("/login");
      } else {
        // Handle error
        const errorModel = result as BaseErrorModel;
        const errorMessage = errorModel.message || "Logout failed";
        setError(errorMessage);
        Logger.error("Logout failed", errorModel);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      Logger.error("Logout error", err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    logout,
    clearError,
  };
};
