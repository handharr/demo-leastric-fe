import { useEffect, useState, useMemo } from "react";
import { GetDeviceUseCase } from "@/features/device/domain/use-cases/get-device-use-case";
import {
  DeviceModel,
  deviceModelDummies,
} from "@/features/device/domain/entities/device-types";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";

const useDummy = false; // Toggle this to switch between dummy and real data

export function useGetDevice(getDevicePathParams: GetDevicePathParams) {
  const [device, setDevice] = useState<DeviceModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pathParams = useMemo(
    () => ({ deviceId: getDevicePathParams.deviceId }),
    [getDevicePathParams.deviceId]
  );

  useEffect(() => {
    const getDeviceUseCase = new GetDeviceUseCase();

    const fetchDevice = async () => {
      setLoading(true);
      setError(null);

      if (useDummy) {
        setDevice(
          deviceModelDummies.find((d) => d.id === pathParams.deviceId) || null
        );
        setLoading(false);
        return;
      }

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
    };

    fetchDevice();
  }, [pathParams]);

  return { device, loading, error };
}
