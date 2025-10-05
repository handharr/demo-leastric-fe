export enum CustomToolTipTextColor {
  primary = "text-leastric-primary",
  secondary = "text-typography-subhead",
}

export interface CustomToolTipPayload {
  value: string;
  textColor: CustomToolTipTextColor;
  prefix?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomToolTipPayload[];
  label?: string | number;
  unit?: string;
  titles?: string[];
  timeUnit?: string;
}

export function CustomTooltip({
  active,
  payload,
  label,
  timeUnit,
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-default-border">
        {timeUnit && (
          <p className="text-sm text-gray-600">{`${timeUnit} ${label}`}</p>
        )}
        {payload &&
          payload.length > 0 &&
          payload.map((entry, index) => (
            <p key={index} className={`text-sm ${entry.textColor} mt-1`}>
              {
                entry.prefix && (
                  <span className="mr-1">{entry.prefix}</span>
                ) /* Render prefix if it exists */
              }
              {entry.value}
            </p>
          ))}
      </div>
    );
  }
  return null;
}
