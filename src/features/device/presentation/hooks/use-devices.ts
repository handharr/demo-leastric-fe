import { useEffect, useState } from "react";
import { GetAllDevicesUseCase } from "@/features/device/domain/use-cases/get-all-device-use-case";
import { DeviceModel } from "@/features/device/domain/entities/device-types";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorModel } from "@/shared/domain/entities/base-error-model";

export function useDevices() {
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const useCase = new GetAllDevicesUseCase();
        const result = await useCase.execute();

        if (isErrorModel(result)) {
          setError(result.message);
        } else {
          setDevices(result); // Adjust if result shape differs
        }
      } catch (e: unknown) {
        setError(
          optional((e as Error)?.message).orDefault("Failed to fetch devices")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  return { devices, loading, error };
}
