import Image from "next/image";
import { getMultiSelectLabel } from "@/shared/presentation/components/filter/multi-select-section";
import {
  FilterMeta,
  FilterOption,
  FilterState,
  FilterType,
} from "@/shared/presentation/types/filter-ui";
import { getSingleSelectLabel } from "./single-select-section";

export interface FilterCategoryItemProps<T extends FilterState> {
  filterKey: string;
  meta: FilterMeta;
  active: boolean;
  onClick: () => void;
  className?: string;
  showBottomBorder?: boolean;
  options: FilterOption[];
  filterState?: T;
}

export function FilterCategoryItem<T extends FilterState>({
  filterKey,
  meta,
  active,
  onClick,
  className = "",
  showBottomBorder = true,
  options,
  filterState,
}: FilterCategoryItemProps<T>) {
  console.log("debugTest render FilterCategoryItem", {
    filterKey,
    filterState,
  });
  let descriptionText = "";
  if (meta.type === FilterType.Single) {
    descriptionText = getSingleSelectLabel({
      options: options,
      selectedId: filterState?.singleSelection?.[filterKey] || "",
      meta: meta,
    });
  } else if (meta.type === FilterType.Multi) {
    descriptionText = getMultiSelectLabel({
      selectedIds: filterState?.multiSelection?.[filterKey] || [],
      options: options,
      meta: meta,
    });
  }

  return (
    <div
      className={`
        px-6 py-2 cursor-pointer hover:bg-gray-50 transition-colors 
        ${active && "bg-gray-50"} 
        ${showBottomBorder && "border-b border-gray-200"} 
        ${className}
        `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-typography-headline">{meta.label}</h3>
          <p className="text-sm text-gray-500">{descriptionText}</p>
        </div>
        <Image
          src="/resources/icons/arrow/chevron-right.svg"
          alt="Arrow"
          width={10}
          height={10}
          className="text-gray-400 w-[10px] h-[10px]"
        />
      </div>
    </div>
  );
}
