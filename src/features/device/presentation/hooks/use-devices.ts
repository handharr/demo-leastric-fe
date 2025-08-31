import { useEffect, useState, useCallback } from "react";
import { GetAllDevicesUseCase } from "@/features/device/domain/use-cases/get-all-device-use-case";
import {
  DeviceModel,
  deviceModelDummies,
} from "@/features/device/domain/entities/device-types";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";

const useDummy = false;

export function useDevices() {
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (useDummy) {
      setDevices(deviceModelDummies);
      setLoading(false);
      return;
    }

    try {
      const useCase = new GetAllDevicesUseCase();
      const result = await useCase.execute();

      Logger.info("useDevices", "execute", result);

      if (isErrorModel(result)) {
        setError(result.message);
      } else {
        setDevices(result);
      }
    } catch (e: unknown) {
      setError(
        optional((e as Error)?.message).orDefault("Failed to fetch devices")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, loading, error, fetchDevices };
}
