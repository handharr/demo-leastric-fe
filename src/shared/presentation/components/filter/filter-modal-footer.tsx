import React from "react";
import { FilterModalFooterProps } from "@/shared/presentation/types/filter-ui";

export function FilterModalFooter({
  onReset,
  onClose,
  onApply,
}: FilterModalFooterProps) {
  return (
    <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-white">
      <button
        onClick={onReset}
        className="text-leastric-primary font-medium hover:text-green-700 transition-colors"
      >
        Reset
      </button>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-typography-headline font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          className="cursor-pointer px-6 py-2.5 bg-leastric-primary text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
