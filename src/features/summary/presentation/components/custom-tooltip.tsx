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
        {payload.map((entry, index) => (
          <p
            key={entry.dataKey}
            className={`text-sm ${
              index == 0 ? "text-leastric-primary" : "text-typography-subhead"
            }`}
          >
            {`${entry.dataKey}: ${entry.value} ${unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
