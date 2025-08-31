import { FilterChip } from "@/shared/presentation/components/filter/filter-chip";

import { FilterType, FilterMeta } from "@/shared/presentation/types/filter-ui";

interface ActiveFilterChipsProps<T = Record<string, unknown>> {
  filters: T;
  onChange: (filters: T) => void;
  meta: Record<keyof T, FilterMeta>;
}

export function ActiveFilterChips<T extends Record<string, unknown>>({
  filters,
  onChange,
  meta,
}: ActiveFilterChipsProps<T>) {
  const hasActive = Object.entries(meta).some(([key, config]) => {
    const value = filters[key as keyof T];
    return config.type === FilterType.Single
      ? value !== config.defaultValue
      : Array.isArray(value) &&
          value.length > 0 &&
          JSON.stringify(value) !== JSON.stringify(config.defaultValue);
  });

  return (
    <div className={`flex flex-wrap gap-3${hasActive ? " mb-6" : ""}`}>
      {Object.entries(meta).map(([key, config]) => {
        const value = filters[key as keyof T];
        const isActive =
          config.type === FilterType.Single
            ? value !== config.defaultValue
            : Array.isArray(value) &&
              value.length > 0 &&
              JSON.stringify(value) !== JSON.stringify(config.defaultValue);

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
  );
}
