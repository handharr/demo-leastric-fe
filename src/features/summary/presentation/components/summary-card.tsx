import { cn } from "@/lib/utils";

import { SummaryCardProps } from "@/features/summary/presentation/types/ui";

export function SummaryCard({
  title,
  description,
  value,
  unit,
  prefix,
  className,
  children,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-default-border p-6 shadow-sm flex flex-col h-full",
        className
      )}
    >
      {/* Top Section - Title and Description */}
      <div className="flex-shrink-0">
        <h3 className="text-lg font-medium text-typography-headline mb-2">
          {title}
        </h3>
        <p className="text-sm text-typography-subhead mb-4">{description}</p>
      </div>

      {/* Bottom Section - Value and Additional Content */}
      <div className="flex-grow flex flex-col justify-end">
        {/* Value */}
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className="text-sm text-typography-subhead">{prefix}</span>
          )}
          <span className="text-2xl font-bold text-typography-headline">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-typography-subhead ml-1">{unit}</span>
          )}
        </div>

        {/* Additional content */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
