import { useEffect, useState, useCallback } from "react";
import { GetDevicesStatusUseCase } from "@/features/device/domain/use-cases/get-devices-status-use-case";
import { GetDevicesStatusModel } from "@/features/device/domain/entities/device-model";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";

interface UseGetDevicesStatusProps {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useGetDevicesStatus({
  enabled = true,
  refetchInterval,
}: UseGetDevicesStatusProps = {}) {
  const [devicesStatus, setDevicesStatus] =
    useState<GetDevicesStatusModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevicesStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const getDevicesStatusUseCase = new GetDevicesStatusUseCase();
      const result = await getDevicesStatusUseCase.execute();
      Logger.info("useGetDevicesStatus", "Fetched devices status:", result);

      if (isErrorModel(result)) {
        Logger.error(
          "useGetDevicesStatus",
          "Error fetching devices status:",
          result
        );
        setError(result.message);
      } else {
        Logger.info(
          "useGetDevicesStatus",
          "Successfully fetched devices status:",
          result
        );
        setDevicesStatus(result);
      }
    } catch (err) {
      Logger.error(
        "useGetDevicesStatus",
        "Error fetching devices status:",
        err
      );
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (enabled) {
      fetchDevicesStatus();
    }
  }, [fetchDevicesStatus, enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchDevicesStatus();
  }, [fetchDevicesStatus, enabled]);

  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    const interval = setInterval(() => {
      fetchDevicesStatus();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [fetchDevicesStatus, enabled, refetchInterval]);

  return {
    devicesStatus,
    loading,
    error,
    refetch,
  };
}
