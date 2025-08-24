interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === "Active"
          ? "bg-brand-subtle text-typography-positive"
          : "bg-brand-subtle-2 text-typography-subhead"
      }`}
    >
      {status}
    </span>
  );
}
