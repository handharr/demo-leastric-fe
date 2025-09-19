import { useEffect, useState, useMemo, useCallback } from "react";
import { GetDeviceUseCase } from "@/features/device/domain/use-cases/get-device-use-case";
import { DeviceModel } from "@/features/device/domain/entities/device-model";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";

interface UseGetDeviceProps {
  getDevicePathParams: GetDevicePathParams;
  enabled?: boolean;
}

export function useGetDevice({
  getDevicePathParams,
  enabled = true,
}: UseGetDeviceProps) {
  const [device, setDevice] = useState<DeviceModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pathParams = useMemo(
    () => ({ deviceId: getDevicePathParams.deviceId }),
    [getDevicePathParams.deviceId]
  );

  const fetchDevice = useCallback(async () => {
    setLoading(true);
    setError(null);

    const getDeviceUseCase = new GetDeviceUseCase();

    try {
      const result = await getDeviceUseCase.execute({
        pathParam: pathParams,
      });
      Logger.info("useGetDevice", "Fetched device:", result);
      if (isErrorModel(result)) {
        Logger.error("useGetDevice", "Error fetching device:", result);
        setError(result.message);
      } else {
        Logger.info("useGetDevice", "Successfully fetched device:", result);
        setDevice(result);
      }
    } catch (err) {
      Logger.error("useGetDevice", "Error fetching device:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [pathParams]);

  useEffect(() => {
    if (!enabled) return;
    fetchDevice();
  }, [fetchDevice, enabled]);

  return { device, loading, error };
}
