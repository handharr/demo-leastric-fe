import { useEffect, useState } from "react";
import { Modal } from "@/shared/presentation/components/modal";
import { DeviceModel } from "@/features/device/domain/entities/device-types";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { useGetDevice } from "@/features/device/presentation/hooks/use-get-device";
import { useUpdateDevice } from "@/features/device/presentation/hooks/use-update-device";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import {
  EmptyData,
  EmptyDataState,
} from "@/shared/presentation/components/empty-data";

type EditDeviceModalProps = {
  device: DeviceModel;
  onSuccessUpdate?: () => void;
};

export function EditDeviceModal({
  device,
  onSuccessUpdate,
}: EditDeviceModalProps) {
  // MARK: STATES
  // Local state for modal open/close
  const [open, setOpen] = useState(false);
  const { showPopup } = usePopup();
  // Add local state for editable fields
  const [deviceName, setDeviceName] = useState(device.deviceName);
  const [tariffGroup, setTariffGroup] = useState(
    optional(device.tariffGroup).orEmpty()
  );
  const [location, setLocation] = useState(optional(device.location).orEmpty());
  // Fetch latest device data when modal opens
  const {
    device: fetchedDevice,
    loading: loadingDevice,
    error: errorDevice,
  } = useGetDevice({
    getDevicePathParams: { deviceId: device.id },
    enabled: open,
  });
  const {
    loading: updating,
    error: updateError,
    success: updateSuccess,
    updateDevice,
    resetUpdateSuccess,
  } = useUpdateDevice();

  // Update local state when fetchedDevice changes
  useEffect(() => {
    if (fetchedDevice) {
      const newDeviceName = optional(fetchedDevice.deviceName).orEmpty();
      if (newDeviceName !== "") {
        setDeviceName(newDeviceName);
      } else {
        setDeviceName(device.deviceName);
      }
      const newTariffGroup = optional(fetchedDevice.tariffGroup).orEmpty();
      if (newTariffGroup !== "") {
        setTariffGroup(newTariffGroup);
      } else {
        setTariffGroup(device.tariffGroup);
      }
      const newLocation = optional(fetchedDevice.location).orEmpty();
      if (newLocation !== "") {
        setLocation(newLocation);
      } else {
        setLocation(device.location);
      }
    }
  }, [fetchedDevice, device]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDevice({
      pathParam: { deviceId: device.id },
      deviceData: {
        deviceName,
        location,
      },
    });
  };

  // Reset success state and close modal on success
  useEffect(() => {
    if (updateSuccess) {
      resetUpdateSuccess();
      onSuccessUpdate?.();
      showPopup("Device updated successfully", PopupType.SUCCESS);
      setOpen(false);
    }
  }, [updateSuccess, showPopup, resetUpdateSuccess, onSuccessUpdate]);

  const formContent = () => (
    <form
      className="flex flex-col gap-[16px] min-w-[30vw]"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block text-sm font-medium mb-1">Device name</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tariff</label>
        <input
          disabled
          className="w-full border rounded px-3 py-2 disabled:bg-form-disabled"
          value={tariffGroup}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Locations</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>
      {updateError && (
        <div className="text-typography-negative mb-2">{updateError}</div>
      )}
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          className="cursor-pointer px-4 py-2 rounded border"
          onClick={() => setOpen(false)}
          disabled={updating}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer px-4 py-2 rounded bg-brand-primary text-white"
          disabled={updating}
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <button
        className="p-1 cursor-pointer rounded"
        onClick={() => setOpen(true)}
        aria-label="Edit device"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
        </svg>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Device"
        description=""
      >
        {loadingDevice ? (
          <EmptyData
            message="Loading device..."
            state={EmptyDataState.LOADING}
          />
        ) : errorDevice ? (
          <EmptyData message={errorDevice} state={EmptyDataState.ERROR} />
        ) : fetchedDevice ? (
          formContent()
        ) : null}
      </Modal>
    </>
  );
}
