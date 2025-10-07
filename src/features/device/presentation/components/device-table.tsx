import { StatusBadge } from "@/shared/presentation/components/status-badge";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { EditDeviceModal } from "@/features/device/presentation/components/edit-device-modal";
import { getDeviceTypeLabel } from "@/features/device/utils/device-helper";
import {
  DeviceModel,
  DeviceStatusModel,
} from "@/features/device/domain/entities/device-model";
import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";
import { EmptyData } from "@/shared/presentation/components/empty-data";

interface DeviceTableProps {
  devices: DeviceModel[];
  devicesStatus: DeviceStatusModel[];
  loading: boolean;
  onEditSuccess?: () => void;
}

export function DeviceTable({
  devices,
  devicesStatus,
  loading,
  onEditSuccess,
}: DeviceTableProps) {
  const devicesArray: DeviceModel[] = Array.isArray(devices) ? devices : [];
  const isEmptyData = devicesArray.length === 0 && !loading;

  const tableContent = loading ? (
    <TableSkeletonLoading />
  ) : (
    devicesArray.map((d, i) => {
      const status = devicesStatus?.find((s) => s.device.id === d.id);
      const isOnline = optionalValue(status?.isOnline).orFalse();
      return (
        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
          <td className="px-4 py-3">{d.deviceName}</td>
          <td className="px-4 py-3">
            <StatusBadge status={isOnline} />
          </td>
          <td className="px-4 py-3">{d.tariffGroup}</td>
          <td className="px-4 py-3">{getDeviceTypeLabel(d.deviceType)}</td>
          <td className="px-4 py-3">{d.location}</td>
          <td className="px-4 py-3">
            <EditDeviceModal device={d} onSuccessUpdate={onEditSuccess} />
          </td>
        </tr>
      );
    })
  );

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border">
      {/* Table */}
      <table className="min-w-full text-sm">
        <thead className="bg-brand-subtle-2 border-b border-gray-200">
          <tr className="text-typography-headline">
            <th className="px-4 py-3 text-left font-semibold">Device name</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Tariff Group</th>
            <th className="px-4 py-3 text-left font-semibold">Device Type</th>
            <th className="px-4 py-3 text-left font-semibold">Location</th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableSkeletonLoading />
          ) : isEmptyData ? (
            <tr>
              <td colSpan={6} className="p-4 text-center">
                <EmptyData />
              </td>
            </tr>
          ) : (
            tableContent
          )}
        </tbody>
      </table>
    </div>
  );
}
