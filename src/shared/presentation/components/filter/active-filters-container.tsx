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
    <div className="flex flex-wrap gap-3">
      {Object.entries(meta).map(([key, config]) => {
        const isActive = isFilterActive({
          filters,
          config,
          metaKey: key as keyof FilterMetas,
        });
        if (!isActive) return null;

        let display: React.ReactNode = "";

        if (config.type === FilterType.Single) {
          const value = filters.singleSelection?.[key as string];
          display = value !== undefined && value !== null ? String(value) : "";
        }

        if (config.type === FilterType.Multi) {
          const value = filters.multiSelection?.[key as string];
          display = (
            <span className="inline-flex items-center justify-center w-6 h-6 bg-leastric-primary text-white text-xs font-medium rounded-full">
              {value?.length}
            </span>
          );
        }

        return (
          <FilterChip
            key={key}
            label={config.label}
            value={display}
            onRemove={() => {
              if (config.type === FilterType.Multi) {
                onChange({
                  ...filters,
                  multiSelection: {
                    ...filters.multiSelection,
                    [key]: config.defaultValue,
                  },
                });
              } else {
                onChange({
                  ...filters,
                  singleSelection: {
                    ...filters.singleSelection,
                    [key]: config.defaultValue,
                  },
                });
              }
            }}
          />
        );
      })}
    </div>
  );
}
