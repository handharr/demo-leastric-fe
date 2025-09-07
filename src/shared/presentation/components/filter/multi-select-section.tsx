import Image from "next/image";
import {
  FilterOption,
  FilterMeta,
  FilterState,
} from "@/shared/presentation/types/filter-ui";

export const getMultiSelectLabel = ({
  selectedIds,
  options,
  meta,
}: {
  selectedIds: string[];
  options: FilterOption[];
  meta: FilterMeta;
}): string => {
  if (selectedIds.length === 0)
    return meta.multipleSelectionConfig?.selectedAllLabel || "All";
  if (selectedIds.length === 1) {
    return (
      options.find((o) => o.id === selectedIds[0])?.label ||
      meta.multipleSelectionConfig?.selectedAllLabel ||
      "All"
    );
  }
  return `${selectedIds.length} ${meta.label}s selected`;
};

export const handleMultiSelect = <T extends FilterState>({
  filterKey,
  id,
  currentFilter,
  filterMeta,
  options,
}: {
  filterKey: string;
  id: string;
  currentFilter: T;
  filterMeta: FilterMeta;
  options: FilterOption[];
}): T => {
  let newSelectedIds = currentFilter.multiSelection?.[filterKey] || [];
  const selectedAllId = filterMeta.multipleSelectionConfig?.selectedAllId;
  if (id === selectedAllId) {
    // If "all" is selected, select all options
    newSelectedIds =
      newSelectedIds.length === options.length
        ? []
        : options.map((option) => option.id);
  } else {
    // Toggle individual selection
    if (newSelectedIds.includes(id)) {
      newSelectedIds = newSelectedIds.filter((selectedId) => selectedId !== id);
    } else {
      newSelectedIds = [...newSelectedIds, id];
    }
    // If all individual options are selected, include "all"
    console.log("debugTest after toggle", { newSelectedIds, options });
    if (selectedAllId && newSelectedIds.length === options.length - 1) {
      newSelectedIds = [...newSelectedIds, selectedAllId];
    } else {
      // Ensure "all" is not selected if not all individual options are selected
      newSelectedIds = newSelectedIds.filter(
        (selectedId) => selectedId !== selectedAllId
      );
    }
  }
  return {
    ...currentFilter,
    multiSelection: {
      ...currentFilter.multiSelection,
      [filterKey]: newSelectedIds,
    },
  };
};

interface MultiSelectSectionProps<T extends FilterState> {
  filterKey: string;
  filters: T;
  options: FilterOption[];
  meta: FilterMeta;
  onUpdateFilters: (filters: T) => void;
}

export function MultiSelectSection<T extends FilterState>({
  filterKey,
  filters,
  options,
  meta,
  onUpdateFilters,
}: MultiSelectSectionProps<T>) {
  const selectedIds = filters.multiSelection?.[filterKey] || [];

  return (
    <div className="p-4">
      <h3 className="font-medium text-typography-headline mb-4">
        {meta.label}
      </h3>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          return (
            <div
              key={option.id}
              className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                const newFilters = handleMultiSelect<T>({
                  filterKey,
                  id: option.id,
                  currentFilter: filters,
                  filterMeta: meta,
                  options,
                });
                onUpdateFilters(newFilters);
              }}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Image
                  src={
                    isSelected
                      ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                      : "/resources/icons/checkbox/checkbox-default.svg"
                  }
                  alt={isSelected ? "Selected" : "Not selected"}
                  width={20}
                  height={20}
                />
              </div>
              <span className="text-sm text-typography-headline">
                {option.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
