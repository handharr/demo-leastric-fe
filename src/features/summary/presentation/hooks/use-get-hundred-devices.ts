import { DeviceModel } from "@/features/device/domain/entities/device-model";
import { GetAllDevicesUseCase } from "@/features/device/domain/use-cases/get-all-device-use-case";
import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { useCallback, useEffect, useState } from "react";
import { GetAllDevicesQueryParams } from "@/features/device/domain/params/query-params";
import { ErrorType } from "@/shared/domain/enum/base-enum";

export interface UseGetHundredDevicesReturn {
  devices: DeviceModel[];
  loading: boolean;
  error: BaseErrorModel | null;
  reloadDevices: () => void;
  reset: () => void;
}

export function useGetHundredDevices(): UseGetHundredDevicesReturn {
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<BaseErrorModel | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const getAllDevicesUseCase = new GetAllDevicesUseCase();
      const queryParam: GetAllDevicesQueryParams = {
        sortOrder: "DESC",
        page: 1,
        take: 100,
        size: 100,
      };
      const result = await getAllDevicesUseCase.execute({
        queryParam,
      });
      if (isErrorModel(result)) {
        setError(result);
        setDevices([]);
      } else {
        setDevices(optionalValue(result.devices).orEmptyArray());
        setError(null);
      }
    } catch (err) {
      Logger.error("useGetHundredDevices - fetchDevices:", err);
      setError({
        type: ErrorType.UNEXPECTED,
        message: "An unexpected error occurred while fetching devices.",
      });
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const reloadDevices = () => {
    fetchDevices();
  };

  const reset = useCallback(() => {
    setDevices([]);
    setLoading(true);
    setError(null);
  }, []);

  return {
    devices,
    loading,
    error,
    reloadDevices,
    reset,
  };
}
