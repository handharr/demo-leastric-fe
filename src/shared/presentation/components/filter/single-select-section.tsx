import Image from "next/image";
import { FilterOption } from "@/shared/presentation/types/filter-ui";

export function SingleSelectSection({
  title,
  options,
  selectedId,
  onSelect,
}: {
  title: string;
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="p-4">
      <h3 className="font-medium text-typography-headline mb-4">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.id}
            className={`p-3 rounded cursor-pointer transition-colors ${
              selectedId === option.id
                ? "bg-green-50 text-leastric-primary"
                : "hover:bg-gray-50"
            }`}
            onClick={() => onSelect(option.id)}
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
