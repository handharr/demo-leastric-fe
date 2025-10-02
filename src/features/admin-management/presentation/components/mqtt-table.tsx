import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";
import { MqttLogModel } from "@/features/admin-management/domain/entity/admin-management-model";

interface MqttTableProps {
  logs: MqttLogModel[];
  loading: boolean;
}

export function MqttTable({ logs, loading }: MqttTableProps) {
  const logsArray = Array.isArray(logs) ? logs : [];

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border">
      {/* Table */}
      <table className="min-w-full text-sm">
        <thead className="bg-brand-subtle-2 border-b border-gray-200">
          <tr className="text-typography-headline">
            <th className="px-4 py-3 text-left font-semibold">Date Time</th>
            <th className="px-4 py-3 text-left font-semibold">Topic</th>
            <th className="px-4 py-3 text-left font-semibold">Payload</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableSkeletonLoading colCount={3} />
          ) : (
            logsArray.map((d, i) => {
              return (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3">{d.dateTime}</td>
                  <td className="px-4 py-3">{d.topic}</td>
                  <td className="px-4 py-3">{d.payload}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
