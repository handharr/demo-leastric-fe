import { useState, useCallback, useEffect } from "react";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { GetLocationsUseCase } from "@/features/device/domain/use-cases/locations/get-locations-use-case";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";

interface UseGetLocationsReturn {
  data: string[] | null;
  isLoading: boolean;
  error: BaseErrorModel | null;
  fetchLocations: () => Promise<void>;
  reset: () => void;
}

export const useGetLocations = (): UseGetLocationsReturn => {
  const [data, setData] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<BaseErrorModel | null>(null);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const getLocationsUseCase = new GetLocationsUseCase();
      const result = await getLocationsUseCase.execute();

      if (Array.isArray(result)) {
        setData(result);
        Logger.info("useGetLocations", "Successfully fetched locations");
      } else {
        setError(result);
        setData(null);
        Logger.error("useGetLocations", "Failed to fetch locations:", result);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      Logger.error("useGetLocations", "Exception occurred:", errorMessage);
      setError({
        message: "Failed to fetch locations",
        details: errorMessage,
        type: ErrorType.UNEXPECTED,
      } as BaseErrorModel);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    data,
    isLoading,
    error,
    fetchLocations,
    reset,
  };
};
