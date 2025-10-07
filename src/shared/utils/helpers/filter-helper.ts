import {
  FilterType,
  FilterState,
  FilterMetas,
  FilterMeta,
} from "@/shared/presentation/types/filter-ui";

/**
 * Checks if all filters are set to their default values.
 * Compares current filter state with default values defined in filter metadata.
 *
 * @param params - Object containing filters and metadata
 * @param params.filters - Current filter state with single and multi selections
 * @param params.meta - Filter metadata containing default values and types
 * @returns True if all filters match their default values, false otherwise
 *
 * @example
 * ```typescript
 * const filters = {
 *   singleSelection: { status: "all", category: "electronics" },
 *   multiSelection: { tags: ["new", "featured"] }
 * };
 *
 * const meta = {
 *   status: { type: FilterType.Single, defaultValue: "all" },
 *   category: { type: FilterType.Single, defaultValue: "all" },
 *   tags: { type: FilterType.Multi, defaultValue: ["new", "featured"] }
 * };
 *
 * isDefaultFilters({ filters, meta }); // false (category is not default)
 *
 * // With all default values
 * const defaultFilters = {
 *   singleSelection: { status: "all", category: "all" },
 *   multiSelection: { tags: ["new", "featured"] }
 * };
 *
 * isDefaultFilters({ filters: defaultFilters, meta }); // true
 * ```
 */
export function isDefaultFilters({
  filters,
  meta,
}: {
  filters: FilterState;
  meta: FilterMetas;
}): boolean {
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

/**
 * Checks if there are any active filters (non-default values).
 * Combines checks for both non-default values and presence of filter items.
 *
 * @param params - Object containing filters and metadata
 * @param params.filters - Current filter state with single and multi selections
 * @param params.meta - Filter metadata containing default values and types
 * @returns True if filters are not default AND have some active items, false otherwise
 *
 * @example
 * ```typescript
 * const filters = {
 *   singleSelection: { status: "active", category: "all" },
 *   multiSelection: { tags: ["premium"] }
 * };
 *
 * const meta = {
 *   status: { type: FilterType.Single, defaultValue: "all" },
 *   category: { type: FilterType.Single, defaultValue: "all" },
 *   tags: { type: FilterType.Multi, defaultValue: [] }
 * };
 *
 * hasActiveFilters({ filters, meta }); // true (status and tags are not default)
 *
 * // With default values
 * const defaultFilters = {
 *   singleSelection: { status: "all", category: "all" },
 *   multiSelection: { tags: [] }
 * };
 *
 * hasActiveFilters({ filters: defaultFilters, meta }); // false
 * ```
 */
export function hasActiveFilters({
  filters,
  meta,
}: {
  filters: FilterState;
  meta: FilterMetas;
}): boolean {
  return (
    !isDefaultFilters({ filters, meta }) &&
    isHasSomeFilterItemActive({ filters, metas: meta })
  );
}

/**
 * Checks if any filter item is currently active (has non-default values).
 * Examines both single and multi-selection filters for active states.
 *
 * @param params - Object containing filters and metadata
 * @param params.filters - Current filter state with single and multi selections
 * @param params.metas - Filter metadata containing default values and types
 * @returns True if at least one filter has non-default values, false otherwise
 *
 * @example
 * ```typescript
 * const filters = {
 *   singleSelection: { status: "all", priority: "high" },
 *   multiSelection: { categories: [], tags: ["urgent"] }
 * };
 *
 * const metas = {
 *   status: { type: FilterType.Single, defaultValue: "all" },
 *   priority: { type: FilterType.Single, defaultValue: "medium" },
 *   categories: { type: FilterType.Multi, defaultValue: [] },
 *   tags: { type: FilterType.Multi, defaultValue: [] }
 * };
 *
 * isHasSomeFilterItemActive({ filters, metas }); // true (priority and tags are active)
 *
 * // With all default values
 * const inactiveFilters = {
 *   singleSelection: { status: "all", priority: "medium" },
 *   multiSelection: { categories: [], tags: [] }
 * };
 *
 * isHasSomeFilterItemActive({ filters: inactiveFilters, metas }); // false
 * ```
 */
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

/**
 * Checks if a specific filter is currently active (has non-default value).
 * Evaluates a single filter against its configuration and default value.
 *
 * @param params - Object containing filter state, config, and key
 * @param params.filters - Current filter state with single and multi selections
 * @param params.config - Filter configuration metadata for the specific filter
 * @param params.metaKey - The key identifying which filter to check
 * @returns True if the specific filter is active (non-default), false otherwise
 *
 * @example
 * ```typescript
 * const filters = {
 *   singleSelection: { status: "pending", category: "all" },
 *   multiSelection: { tags: ["important", "review"] }
 * };
 *
 * // Check single selection filter
 * const statusConfig = { type: FilterType.Single, defaultValue: "all" };
 * isFilterActive({ filters, config: statusConfig, metaKey: "status" }); // true
 *
 * const categoryConfig = { type: FilterType.Single, defaultValue: "all" };
 * isFilterActive({ filters, config: categoryConfig, metaKey: "category" }); // false
 *
 * // Check multi selection filter
 * const tagsConfig = { type: FilterType.Multi, defaultValue: [] };
 * isFilterActive({ filters, config: tagsConfig, metaKey: "tags" }); // true
 *
 * // With default multi-selection value
 * const defaultTagsConfig = { type: FilterType.Multi, defaultValue: ["important", "review"] };
 * isFilterActive({ filters, config: defaultTagsConfig, metaKey: "tags" }); // false
 * ```
 */
export function isFilterActive({
  filters,
  config,
  metaKey,
}: {
  filters: FilterState;
  config: FilterMeta;
  metaKey: keyof FilterMetas;
}): boolean {
  if (config.type === FilterType.Single) {
    const value = filters.singleSelection?.[metaKey as string];
    if (!value) return false;
    return value !== config.defaultValue;
  } else {
    const value = filters.multiSelection?.[metaKey as string];
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      JSON.stringify(value) !== JSON.stringify(config.defaultValue)
    );
  }
}

/**
 * Creates a default filter state object based on filter metadata.
 * Initializes all filters with their default values as defined in metadata.
 *
 * @param meta - Filter metadata containing default values and types for all filters
 * @returns Filter state object with all filters set to default values
 *
 * @example
 * ```typescript
 * const meta = {
 *   status: { type: FilterType.Single, defaultValue: "all" },
 *   priority: { type: FilterType.Single, defaultValue: "medium" },
 *   categories: { type: FilterType.Multi, defaultValue: [] },
 *   tags: { type: FilterType.Multi, defaultValue: ["general"] },
 *   departments: { type: FilterType.Multi, defaultValue: ["sales", "marketing"] }
 * };
 *
 * const defaultFilters = getDefaultFilters(meta);
 * // Output:
 * // {
 * //   singleSelection: {
 * //     status: "all",
 * //     priority: "medium"
 * //   },
 * //   multiSelection: {
 * //     categories: [],
 * //     tags: ["general"],
 * //     departments: ["sales", "marketing"]
 * //   }
 * // }
 *
 * // Can be used to reset filters
 * const resetFilters = getDefaultFilters(reportFilterMeta);
 * setFilters(resetFilters);
 * ```
 */
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
