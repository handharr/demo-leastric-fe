import Image from "next/image";
import {
  FilterMeta,
  FilterOption,
  FilterState,
} from "@/shared/presentation/types/filter-ui";

export const getSingleSelectLabel = ({
  options,
  selectedId,
  meta,
}: {
  options: FilterOption[];
  selectedId: string;
  meta: FilterMeta;
}): string =>
  options.find((o) => o.id === selectedId)?.label ||
  (meta.defaultValue as string) ||
  "All";

export const handleSingleSelect = <T extends FilterState>({
  filterKey,
  id,
  currentFilter,
}: {
  filterKey: string;
  id: string;
  currentFilter: T;
}): T => {
  return {
    ...currentFilter,
    singleSelection: { ...currentFilter.singleSelection, [filterKey]: id },
  };
};

interface SingleSelectSectionProps<T extends FilterState> {
  filterKey: string;
  filters: T;
  meta: FilterMeta;
  options: FilterOption[];
  onUpdateFilters: (newFilters: T) => void;
}

export function SingleSelectSection<T extends FilterState>({
  filterKey,
  filters,
  meta,
  options,
  onUpdateFilters,
}: SingleSelectSectionProps<T>) {
  const selectedId = filters.singleSelection?.[filterKey] || "";
  return (
    <div className="p-4">
      <h3 className="font-medium text-typography-headline mb-4">
        {meta.label}
      </h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.id}
            className={`p-3 rounded cursor-pointer transition-colors ${
              selectedId === option.id
                ? "bg-green-50 text-leastric-primary"
                : "hover:bg-gray-50"
            }`}
            onClick={() => {
              const newFilters = handleSingleSelect<T>({
                filterKey,
                id: option.id,
                currentFilter: filters,
              });
              onUpdateFilters(newFilters);
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{option.label}</span>
              {selectedId === option.id && (
                <Image
                  src="/resources/icons/menu/check.svg"
                  alt="Selected"
                  width={16}
                  height={16}
                  className="text-leastric-primary"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
