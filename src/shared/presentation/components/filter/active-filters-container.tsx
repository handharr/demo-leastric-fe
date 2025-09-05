import {
  isDefaultFilters,
  isFilterActive,
} from "@/shared/utils/helpers/filter-helper";
import { FilterChip } from "@/shared/presentation/components/filter/filter-chip";

import {
  FilterType,
  FilterState,
  FilterMetas,
} from "@/shared/presentation/types/filter-ui";

interface ActiveFiltersContainerProps<T extends FilterState> {
  filters: T;
  onChange: (filters: T) => void;
  meta: FilterMetas;
}

export function ActiveFiltersContainer<T extends FilterState>({
  filters,
  onChange,
  meta,
}: ActiveFiltersContainerProps<T>) {
  const hasActive = !isDefaultFilters({
    filters,
    meta,
  });

  if (!hasActive) return null;

  return (
    <div className="px-6 pt-6 pb-4 border-b border-gray-200">
      <div className="flex flex-wrap gap-3">
        {Object.entries(meta).map(([key, config]) => {
          const value = filters[key as keyof T];
          const isActive = isFilterActive({
            filters,
            config,
            metaKey: key as keyof FilterMetas,
          });

          if (!isActive) return null;

          let display: React.ReactNode =
            value !== undefined && value !== null ? String(value) : "";
          if (config.type === FilterType.Multi && Array.isArray(value)) {
            display = (
              <span className="inline-flex items-center justify-center w-6 h-6 bg-leastric-primary text-white text-xs font-medium rounded-full">
                {value.length}
              </span>
            );
          }

          return (
            <FilterChip
              key={key}
              label={config.label}
              value={display}
              onRemove={() =>
                onChange({ ...filters, [key]: config.defaultValue })
              }
            />
          );
        })}
      </div>
    </div>
  );
}
