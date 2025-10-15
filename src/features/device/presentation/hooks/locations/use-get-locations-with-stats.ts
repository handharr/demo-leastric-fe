import { useState, useCallback } from "react";
import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { LocationStatsModel } from "@/features/device/domain/entities/locations-models";
import { GetLocationsWithStatsUseCase } from "@/features/device/domain/use-cases/locations/get-locations-with-stats-use-case";
import { Logger } from "@/core/utils/logger/logger";

interface UseGetLocationsWithStatsReturn {
  data: LocationStatsModel[] | null;
  isLoading: boolean;
  error: BaseErrorModel | null;
  fetchLocationStats: () => Promise<void>;
  reset: () => void;
}

export const useGetLocationsWithStats = (): UseGetLocationsWithStatsReturn => {
  const [data, setData] = useState<LocationStatsModel[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<BaseErrorModel | null>(null);

  const fetchLocationStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const getLocationsWithStatsUseCase = new GetLocationsWithStatsUseCase();
      const result = await getLocationsWithStatsUseCase.execute();

      if (Array.isArray(result)) {
        setData(result);
        Logger.info(
          "useGetLocationsWithStats",
          "Successfully fetched location stats"
        );
      } else {
        setError(result);
        setData(null);
        Logger.error(
          "useGetLocationsWithStats",
          "Failed to fetch location stats:",
          result
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      Logger.error(
        "useGetLocationWithStats",
        "Exception occurred:",
        errorMessage
      );
      setError({
        message: "Failed to fetch location stats",
        details: errorMessage,
        type: "UNEXPECTED",
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

  return {
    data,
    isLoading,
    error,
    fetchLocationStats,
    reset,
  };
};
