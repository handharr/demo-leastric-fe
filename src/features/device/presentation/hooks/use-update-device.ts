import { useState, useCallback } from "react";
import { UpdateDeviceUseCase } from "@/features/device/domain/use-cases/update-device-use-case";
import { GetDevicePathParams } from "@/features/device/domain/params/path-params";
import { UpdateDeviceFormData } from "@/features/device/domain/params/data-params";
import {
  DeviceModel,
  deviceModelDummies,
} from "@/features/device/domain/entities/device-model";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";

type UpdateDeviceResult = {
  loading: boolean;
  error: string | null;
  success: boolean;
  updatedDevice: DeviceModel | null;
  updateDevice: ({
    pathParam,
    deviceData,
  }: {
    pathParam: GetDevicePathParams;
    deviceData: UpdateDeviceFormData;
  }) => Promise<void>;
  resetUpdateSuccess: () => void;
};

const isUseDummy = false;

export function useUpdateDevice(): UpdateDeviceResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [updatedDevice, setUpdatedDevice] = useState<DeviceModel | null>(null);

  const resetUpdateSuccess = useCallback(() => setSuccess(false), []);

  const updateDevice = useCallback(
    async ({
      pathParam,
      deviceData,
    }: {
      pathParam: GetDevicePathParams;
      deviceData: UpdateDeviceFormData;
    }) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setUpdatedDevice(null);

      if (isUseDummy) {
        const device = deviceModelDummies.find(
          (d) => d.id === pathParam.deviceId
        );
        if (!device) {
          setError("Device not found");
          setLoading(false);
          return;
        }
        setUpdatedDevice({ ...device, ...deviceData });
        setSuccess(true);
        setLoading(false);
        return;
      }

      const useCase = new UpdateDeviceUseCase();
      const result = await useCase.execute({ pathParam, deviceData });

      if (isErrorModel(result)) {
        setError(result.message || "Unknown error");
        setLoading(false);
        return;
      }

      setUpdatedDevice(result);
      setSuccess(true);
      setLoading(false);
    },
    []
  );

  return {
    loading,
    error,
    success,
    updatedDevice,
    updateDevice,
    resetUpdateSuccess,
  };
}
