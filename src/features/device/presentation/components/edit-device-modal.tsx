import { useEffect, useState } from "react";
import { Modal } from "@/shared/presentation/components/modal";
import { DeviceModel } from "@/features/device/domain/entities/device-types";
import { Select } from "@/shared/presentation/components/select";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { useGetDevice } from "@/features/device/presentation/hooks/use-get-device";
import { useUpdateDevice } from "@/features/device/presentation/hooks/use-update-device";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";

const tariffOptions = [
  { label: "R1", value: "R1" },
  { label: "R2", value: "R2" },
  { label: "B3", value: "B3" },
  { label: "I3", value: "I3" },
  { label: "I4", value: "I4" },
  { label: "P1", value: "P1" },
];

const locationOptions = [
  { label: "Location 1", value: "Location 1" },
  { label: "Location 2", value: "Location 2" },
  { label: "Location 3", value: "Location 3" },
  { label: "Location 4", value: "Location 4" },
  { label: "Location 5", value: "Location 5" },
];

type EditDeviceModalProps = {
  device: DeviceModel;
};

export function EditDeviceModal({ device }: EditDeviceModalProps) {
  const [open, setOpen] = useState(false);
  const { showPopup } = usePopup();

  // Fetch latest device data when modal opens
  const {
    device: fetchedDevice,
    loading: loadingDevice,
    error: errorDevice,
  } = useGetDevice({ deviceId: device.id });
  const {
    loading: updating,
    error: updateError,
    success: updateSuccess,
    updateDevice,
    resetUpdateSuccess,
  } = useUpdateDevice();

  // Add local state for editable fields
  const [deviceName, setDeviceName] = useState(device.deviceName);
  const [tariffGroup, setTariffGroup] = useState(
    optional(device.tariffGroup).orEmpty()
  );
  const [location, setLocation] = useState(optional(device.location).orEmpty());

  // Update local state when fetchedDevice changes
  useEffect(() => {
    if (fetchedDevice) {
      setDeviceName(fetchedDevice.deviceName);
      setTariffGroup(optional(fetchedDevice.tariffGroup).orEmpty());
      setLocation(optional(fetchedDevice.location).orEmpty());
    }
  }, [fetchedDevice]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDevice({
      pathParam: { deviceId: device.id },
      deviceData: {
        deviceName,
        tariffGroup,
        location,
      },
    });
  };

  // Reset success state and close modal on success
  useEffect(() => {
    if (updateSuccess) {
      showPopup("Device updated successfully", PopupType.SUCCESS);
      setOpen(false);
      resetUpdateSuccess();
    }
  }, [updateSuccess, showPopup, resetUpdateSuccess]);

  const formContent = () => (
    <form className="min-w-[30vw]" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Device name</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Tariff</label>
        <Select
          value={tariffGroup}
          onChange={setTariffGroup}
          options={tariffOptions}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Locations</label>
        <Select
          value={location}
          onChange={setLocation}
          options={locationOptions}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Sub-location</label>
        <input
          disabled
          className="w-full border rounded px-3 py-2 disabled:bg-form-disabled"
          value={fetchedDevice?.subLocation ?? device.subLocation}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Detail location
        </label>
        <input
          disabled
          className="w-full border rounded px-3 py-2 disabled:bg-form-disabled"
          value={fetchedDevice?.detailLocation ?? device.detailLocation}
        />
      </div>
      {updateError && <div className="text-red-500 mb-2">{updateError}</div>}
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
          <div>Loading...</div>
        ) : errorDevice ? (
          <div className="text-red-500">{errorDevice}</div>
        ) : fetchedDevice ? (
          formContent()
        ) : null}
      </Modal>
    </>
  );
}
