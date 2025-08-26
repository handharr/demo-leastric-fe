import { useEffect, useState } from "react";
import { GetDeviceUseCase } from "@/features/device/domain/use-cases/get-device-use-case";
import {
  DeviceModel,
  deviceModelDummies,
} from "@/features/device/domain/entities/device-types";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";

const useDummy = true;

export function useGetDevice(getDevicePathParams: GetDevicePathParams) {
  const [device, setDevice] = useState<DeviceModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDeviceUseCase = new GetDeviceUseCase();

    const fetchDevice = async () => {
      setLoading(true);
      setError(null);

      if (useDummy) {
        setDevice(
          deviceModelDummies.find(
            (d) => d.id === getDevicePathParams.deviceId
          ) || null
        );
        setLoading(false);
        return;
      }

      try {
        const result = await getDeviceUseCase.execute({
          pathParam: getDevicePathParams,
        });
        if (isErrorModel(result)) {
          setError(result.message);
        } else {
          setDevice(result);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [getDevicePathParams]);

  return { device, loading, error };
}
