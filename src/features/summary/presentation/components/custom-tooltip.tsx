import { CustomTooltipProps } from "@/features/summary/presentation/types/ui";

export function CustomTooltip({
  active,
  payload,
  label,
  unit = "KWh",
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-default-border">
        <p className="text-sm text-gray-600">{`Day ${label}`}</p>
        <p className="text-sm font-semibold text-leastric-secondary">
          {`${payload[0].value} ${unit}`}
        </p>
      </div>
    );
  }
  return null;
}
