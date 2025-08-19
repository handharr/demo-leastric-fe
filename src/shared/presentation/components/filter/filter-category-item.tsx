import Image from "next/image";
import { FilterCategoryItemProps } from "@/shared/presentation/types/filter-ui";

export function FilterCategoryItem({
  title,
  description,
  active,
  onClick,
  className = "",
}: FilterCategoryItemProps) {
  return (
    <div
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        active ? "bg-gray-50" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-typography-headline">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Image
          src="/resources/icons/arrow/chevron-right.svg"
          alt="Arrow"
          width={16}
          height={16}
          className="text-gray-400 w-[16px] h-[16px]"
        />
      </div>
    </div>
  );
}
