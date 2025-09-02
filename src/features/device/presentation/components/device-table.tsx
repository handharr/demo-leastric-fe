import { StatusBadge } from "@/shared/presentation/components/status-badge";
import { useDevices } from "@/features/device/presentation/hooks/use-devices";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { EditDeviceModal } from "@/features/device/presentation/components/edit-device-modal";
import { Pagination } from "@/shared/presentation/components/pagination";
import {
  EmptyData,
  EmptyDataState,
} from "@/shared/presentation/components/empty-data";
import { getDeviceTypeLabel } from "@/features/device/utils/device-helper";

export function DeviceTable() {
  const {
    devices,
    loading,
    error,
    pagination,
    fetchDevices,
    nextPage,
    previousPage,
    goToPage,
  } = useDevices();

  if (loading) {
    return (
      <EmptyData message="Loading Devices..." state={EmptyDataState.LOADING} />
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40 text-typography-negative">
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
              <th className="px-4 py-3 text-left font-semibold">Location</th>
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
                <td className="px-4 py-3">
                  {getDeviceTypeLabel(d.deviceType)}
                </td>
                <td className="px-4 py-3">{d.location}</td>
                <td className="px-4 py-3">
                  <EditDeviceModal device={d} onSuccessUpdate={fetchDevices} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        model={pagination}
        onPageChange={(page) => goToPage(page)}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
      />
    </div>
  );
}
