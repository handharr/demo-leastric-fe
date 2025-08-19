import React from "react";
import clsx from "clsx";
import { FilterChipProps } from "@/shared/presentation/types/filter-ui";
import Image from "next/image";

export const FilterChip: React.FC<FilterChipProps> = ({
  label = "",
  value,
  onRemove,
  className,
}) => (
  <div
    className={clsx(
      "flex items-center border border-default-border rounded-full px-4 py-1 bg-white text-typography-headline text-sm justify-center",
      className
    )}
  >
    {label}
    {value && <span className="ml-2">{value}</span>}
    <button
      className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"
      onClick={onRemove}
      aria-label={`Remove ${label.toLowerCase()} filter`}
      type="button"
    >
      <Image
        src="/resources/icons/menu/close.svg"
        alt="Remove filter"
        width={10}
        height={10}
        className="w-[10px] h-[10px]"
      />
    </button>
  </div>
);
