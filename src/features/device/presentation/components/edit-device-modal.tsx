import { useState } from "react";
import { Modal } from "@/shared/presentation/components/modal";
import { DeviceModel } from "@/features/device/domain/entities/device-types";
import { Select } from "@/shared/presentation/components/select";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";

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
  const [tariffGroup, setTariffGroup] = useState(
    optional(device.tariffGroup).orEmpty()
  );
  const [location, setLocation] = useState(optional(device.location).orEmpty());

  return (
    <>
      <button
        className="p-1 hover:bg-gray-100 rounded"
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
        <form className="min-w-[30vw]">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Device name
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              defaultValue={device.deviceName}
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
            <label className="block text-sm font-medium mb-1">
              Sub-location
            </label>
            <input
              disabled
              className="w-full border rounded px-3 py-2 disabled:bg-form-disabled"
              defaultValue={device.subLocation}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Detail location
            </label>
            <input
              disabled
              className="w-full border rounded px-3 py-2 disabled:bg-form-disabled"
              defaultValue={device.detailLocation}
            />
          </div>
          {/* Add more fields as needed */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-brand-primary text-white"
              disabled
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
