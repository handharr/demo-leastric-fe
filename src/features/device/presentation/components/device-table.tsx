import { StatusBadge } from "@/shared/presentation/components/status-badge";
import { useDevices } from "@/features/device/presentation/hooks/use-devices";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { EditDeviceModal } from "@/features/device/presentation/components/edit-device-modal";
import { useState } from "react";
import {
  PaginationModel,
  Pagination,
} from "@/shared/presentation/components/pagination";

export function DeviceTable() {
  const { devices, loading, error } = useDevices();
  const [pagination, setPagination] = useState<PaginationModel>({
    total: 10,
    page: 1,
    pageSize: 10,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        Loading devices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40 text-red-500">
        {error}
      </div>
    );
  }

  const devicesArray = Array.isArray(devices) ? devices : [];

  return (
    <div>
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        {/* Table */}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="px-4 py-3 text-left font-semibold">Device name</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">
                Tariff Group
              </th>
              <th className="px-4 py-3 text-left font-semibold">Device Type</th>
              <th className="px-4 py-3 text-left font-semibold">Power (VA)</th>
              <th className="px-4 py-3 text-left font-semibold">Location</th>
              <th className="px-4 py-3 text-left font-semibold">
                Sub-location
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                Detail location
              </th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {devicesArray.map((d, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3">{d.deviceName}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={optional(d.status).orDefault("Unknown")}
                  />
                </td>
                <td className="px-4 py-3">{d.tariffGroup}</td>
                <td className="px-4 py-3">{d.deviceType}</td>
                <td className="px-4 py-3">{d.power}</td>
                <td className="px-4 py-3">{d.location}</td>
                <td className="px-4 py-3">{d.subLocation}</td>
                <td className="px-4 py-3">{d.detailLocation}</td>
                <td className="px-4 py-3">
                  <EditDeviceModal device={d} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        model={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
