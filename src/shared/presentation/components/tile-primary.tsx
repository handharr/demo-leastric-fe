import { ReactNode } from "react";

interface TilePrimaryProps {
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
  topRightContent?: ReactNode;
}

export function TilePrimary({
  title,
  description,
  className,
  children,
  topRightContent,
}: TilePrimaryProps) {
  return (
    <div
      className={`flex flex-col bg-white rounded-lg border border-gray-200 p-[24px] ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-typography-headline mb-1">
            {title}
          </h3>
          <p className="text-sm text-typography-subhead">{description}</p>
        </div>
        {topRightContent}
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
