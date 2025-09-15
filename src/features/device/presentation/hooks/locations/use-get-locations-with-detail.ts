import { useState, useCallback } from "react";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { LocationModel } from "@/features/device/domain/entities/locations-models";
import { GetLocationsWithDetailUseCase } from "@/features/device/domain/use-cases/locations/get-locations-with-detail-use-case";
import { Logger } from "@/shared/utils/logger/logger";

interface UseGetLocationsWithDetailReturn {
  data: LocationModel[] | null;
  isLoading: boolean;
  error: BaseErrorModel | null;
  fetchLocationsWithDetail: () => Promise<void>;
  reset: () => void;
}

export const useGetLocationsWithDetail =
  (): UseGetLocationsWithDetailReturn => {
    const [data, setData] = useState<LocationModel[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<BaseErrorModel | null>(null);

    const fetchLocationsWithDetail = useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const getLocationsWithDetailUseCase =
          new GetLocationsWithDetailUseCase();
        const result = await getLocationsWithDetailUseCase.execute();

        if (Array.isArray(result)) {
          setData(result);
          Logger.info(
            "useGetLocationsWithDetail",
            "Successfully fetched locations with detail"
          );
        } else {
          setError(result);
          setData(null);
          Logger.error(
            "useGetLocationsWithDetail",
            "Failed to fetch locations with detail:",
            result
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        Logger.error(
          "useGetLocationsWithDetail",
          "Exception occurred:",
          errorMessage
        );
        setError({
          message: "Failed to fetch locations with detail",
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
      fetchLocationsWithDetail,
      reset,
    };
  };
