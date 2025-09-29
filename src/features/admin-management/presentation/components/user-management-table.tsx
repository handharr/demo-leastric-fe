import { TableSkeletonLoading } from "@/shared/presentation/components/loading/table-skeleton-loading";

interface UserManagementTableProps {
  users: string[];
  loading: boolean;
}

export function UserManagementTable({
  users,
  loading,
}: UserManagementTableProps) {
  const usersArray = Array.isArray(users) ? users : [];

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border">
      {/* Table */}
      <table className="min-w-full text-sm">
        <thead className="bg-brand-subtle-2 border-b border-gray-200">
          <tr className="text-typography-headline">
            <th className="px-4 py-3 text-left font-semibold">Full Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Phone Number</th>
            <th className="px-4 py-3 text-left font-semibold">Company</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableSkeletonLoading />
          ) : (
            usersArray.map((d, i) => {
              return (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3">Full Name {i}</td>
                  <td className="px-4 py-3">Email {i}</td>
                  <td className="px-4 py-3">Phone Number {i}</td>
                  <td className="px-4 py-3">Company {i}</td>
                  <td className="px-4 py-3">Status {i}</td>
                  <td className="px-4 py-3">Actions {i}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
