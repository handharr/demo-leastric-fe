import {
  FilterType,
  FilterState,
  FilterMetas,
  FilterMeta,
} from "@/shared/presentation/types/filter-ui";

export function isDefaultFilters({
  filters,
  meta,
}: {
  filters: FilterState;
  meta: FilterMetas;
}) {
  // Get all default values from reportFilterMeta and compare with all values in filters
  return Object.entries(meta).every(([key, value]) => {
    if (value.type === FilterType.Single) {
      return filters.singleSelection?.[key] === value.defaultValue;
    } else if (value.type === FilterType.Multi) {
      const defaultArray = value.defaultValue as string[];
      const currentArray = filters.multiSelection?.[key] || [];
      return (
        currentArray.length === defaultArray.length &&
        currentArray.every((val) => defaultArray.includes(val))
      );
    }
    return true;
  });
}

export function hasActiveFilters({
  filters,
  meta,
}: {
  filters: FilterState;
  meta: FilterMetas;
}) {
  return (
    !isDefaultFilters({ filters, meta }) &&
    isHasSomeFilterItemActive({ filters, metas: meta })
  );
}

export function isHasSomeFilterItemActive({
  filters,
  metas,
}: {
  filters: FilterState;
  metas: FilterMetas;
}): boolean {
  return Object.entries(metas).some(([key, meta]) => {
    if (meta.type === FilterType.Single) {
      const value = filters.singleSelection?.[key as string];
      return (value && value !== meta.defaultValue) || false;
    } else {
      const value = filters.multiSelection?.[key as string];
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        JSON.stringify(value) !== JSON.stringify(meta.defaultValue)
      );
    }
  });
}

export function isFilterActive({
  filters,
  config,
  metaKey,
}: {
  filters: FilterState;
  config: FilterMeta;
  metaKey: keyof FilterMetas;
}) {
  if (config.type === FilterType.Single) {
    const value = filters.singleSelection?.[metaKey as string];
    return value && value !== config.defaultValue;
  } else {
    const value = filters.multiSelection?.[metaKey as string];
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      JSON.stringify(value) !== JSON.stringify(config.defaultValue)
    );
  }
}

export function getDefaultFilters<T extends FilterState, M extends FilterMetas>(
  meta: M
): T {
  const singleSelection: Record<string, string> = {};
  const multiSelection: Record<string, string[]> = {};
  Object.entries(meta).forEach(([key, value]) => {
    if (value.type === FilterType.Single) {
      singleSelection[key] = value.defaultValue as string;
    } else if (value.type === FilterType.Multi) {
      multiSelection[key] = value.defaultValue as string[];
    }
  });
  return { singleSelection, multiSelection } as T;
}
