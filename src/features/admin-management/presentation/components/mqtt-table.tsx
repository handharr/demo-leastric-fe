import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";
import { MqttLogModel } from "@/features/admin-management/domain/entity/admin-management-model";

interface MqttTableProps {
  logs: MqttLogModel[];
  loading: boolean;
}

export function MqttTable({ logs, loading }: MqttTableProps) {
  const logsArray = Array.isArray(logs) ? logs : [];

  return (
    <div className="w-full overflow-hidden bg-white rounded-xl shadow border">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-subtle-2 border-b border-gray-200">
            <tr className="text-typography-headline">
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap min-w-[150px]">
                Date Time
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap min-w-[200px]">
                Topic
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap min-w-[300px]">
                Payload
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonLoading colCount={3} />
            ) : (
              logsArray.map((d, i) => {
                return (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {d.dateTime}
                    </td>
                    <td className="px-4 py-3 break-all max-w-[200px]">
                      {d.topic}
                    </td>
                    <td className="px-4 py-3 break-all max-w-[300px]">
                      {d.payload}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
