import Image from "next/image";
import { FilterOption } from "@/shared/presentation/types/filter-ui";

export function MultiSelectSection({
  title,
  options,
  selectedIds,
  onToggle,
  allSelected,
}: {
  title: string;
  options: FilterOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  allSelected: boolean;
}) {
  return (
    <div className="p-4">
      <h3 className="font-medium text-typography-headline mb-4">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const isAll = option.id === "all";
          const isSelected = isAll
            ? allSelected
            : selectedIds.includes(option.id);
          return (
            <div
              key={option.id}
              className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onToggle(option.id)}
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
