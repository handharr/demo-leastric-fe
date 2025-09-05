import {
  FilterType,
  FilterState,
  FilterMeta,
  FilterMetas,
} from "@/shared/presentation/types/filter-ui";

export function isDefaultFilters({
  filters,
  meta,
}: {
  filters: FilterState;
  meta: Record<string, FilterMeta>;
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
