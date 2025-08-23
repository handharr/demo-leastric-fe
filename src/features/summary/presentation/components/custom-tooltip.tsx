import { optional } from "@/shared/utils/wrappers/optional-wrapper";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string | number;
  unit?: string;
  titles?: string[];
}

export function CustomTooltip({
  active,
  payload,
  label,
  unit = "KWh",
  titles = [],
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-default-border">
        <p className="text-sm text-gray-600">{`Day ${label}`}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className={`text-sm ${
              index == 0 ? "text-leastric-primary" : "text-typography-subhead"
            }`}
          >
            {`${optional(titles[index]).orEmpty()}: ${entry.value} ${unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
