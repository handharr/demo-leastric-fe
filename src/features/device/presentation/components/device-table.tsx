import { StatusBadge } from "@/shared/presentation/components/status-badge";
import { useDevices } from "@/features/device/presentation/hooks/use-devices";
import { optional } from "@/shared/utils/wrappers/optional-wrapper";
import { EditDeviceModal } from "@/features/device/presentation/components/edit-device-modal";

export function DeviceTable() {
  const { devices, loading, error } = useDevices();

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

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border">
      {/* Table */}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-700">
            <th className="px-4 py-3 text-left font-semibold">Device name</th>
            <th className="px-4 py-3 text-left font-semibold">Device Type</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Tariff Group</th>
            <th className="px-4 py-3 text-left font-semibold">Device Type</th>
            <th className="px-4 py-3 text-left font-semibold">Power (VA)</th>
            <th className="px-4 py-3 text-left font-semibold">Location</th>
            <th className="px-4 py-3 text-left font-semibold">Sub-location</th>
            <th className="px-4 py-3 text-left font-semibold">
              Detail location
            </th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3">{d.deviceName}</td>
              <td className="px-4 py-3">{d.deviceType}</td>
              <td className="px-4 py-3">
                <StatusBadge status={optional(d.status).orDefault("Unknown")} />
              </td>
              <td className="px-4 py-3">{d.tariffGroup}</td>
              <td className="px-4 py-3">{d.phase}</td>
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-gray-600 text-sm">
        <span>
          Show <b>1-10</b> of <b>100</b> data
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-gray-200" disabled>
            <span className="text-gray-400">&laquo;</span>
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              className={`px-2 py-1 rounded ${
                n === 1
                  ? "bg-green-100 border border-brand-secondary text-brand-primary"
                  : "hover:bg-gray-200"
              }`}
            >
              {n}
            </button>
          ))}
          <button className="p-1 rounded hover:bg-gray-200">
            <span className="text-gray-600">&raquo;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
