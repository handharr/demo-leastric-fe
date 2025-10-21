import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  description: string;
  value: string | number;
  unit?: string;
  prefix?: string;
  className?: string;
  children?: React.ReactNode;
}

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
        "bg-white rounded-lg border border-default-border p-[16px] shadow-sm flex flex-col h-full min-w-0",
        className
      )}
    >
      {/* Top Section - Title and Description */}
      <div className="flex-shrink-0">
        <h3 className="text-lg font-medium text-typography-headline mb-[4px] break-words">
          {title}
        </h3>
        <p className="text-sm text-typography-subhead mb-[8px] break-words">
          {description}
        </p>
      </div>

      {/* Bottom Section - Value and Additional Content */}
      <div className="flex-grow flex flex-col justify-end min-w-0">
        {/* Value */}
        <div className="flex items-baseline gap-1 flex-wrap min-w-0">
          {prefix && (
            <span className="text-sm text-typography-subhead flex-shrink-0">
              {prefix}
            </span>
          )}
          <span className="text-2xl font-bold text-typography-headline break-all min-w-0">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-typography-subhead ml-1 flex-shrink-0">
              {unit}
            </span>
          )}
        </div>

        {/* Additional content */}
        {children && <div className="mt-4 min-w-0">{children}</div>}
      </div>
    </div>
  );
}
