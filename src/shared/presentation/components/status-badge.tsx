interface StatusBadgeProps {
  status: boolean;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusLabel = status ? "Active" : "Inactive";
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status
          ? "bg-brand-subtle text-typography-positive"
          : "bg-brand-subtle-2 text-typography-subhead"
      }`}
    >
      {statusLabel}
    </span>
  );
}
