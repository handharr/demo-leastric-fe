import React from "react";
import { FilterModalFooterProps } from "@/shared/presentation/types/filter-ui";

export function FilterModalFooter({
  onReset,
  onClose,
  onApply,
}: FilterModalFooterProps) {
  return (
    <div className="p-[16px] border-t border-gray-200 flex items-center justify-between bg-white">
      <button
        onClick={onReset}
        className="text-leastric-primary font-medium hover:text-brand-primary transition-colors"
      >
        Reset
      </button>
      <div className="flex gap-[12px]">
        <button
          onClick={onClose}
          className="px-[12px] py-[9.5px] border border-gray-300 rounded-lg text-typography-headline font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          className="cursor-pointer px-[12px] py-[9.5px] bg-leastric-primary text-white rounded-lg font-semibold hover:bg-brand-primary transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
