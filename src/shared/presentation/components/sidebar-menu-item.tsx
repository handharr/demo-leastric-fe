import { SidebarMenuItemProps } from "@/shared/presentation/types/ui";
import Image from "next/image";

export default function SidebarMenuItem({
  label,
  isActive = false,
  onClick,
  iconSource,
}: SidebarMenuItemProps) {
  if (isActive) {
    return (
      <div className="bg-[#dff6e9] relative flex items-center gap-2 p-2 rounded-lg mb-1 w-full">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#2a6335] rounded-r" />
        {iconSource && (
          <Image
            src={`${iconSource}.svg`}
            alt={label}
            width={16}
            height={16}
            className="text-[#2a6335]"
          />
        )}
        <span className="font-semibold text-[#2a6335] text-sm flex-1">
          {label}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left"
    >
      {iconSource && (
        <Image
          src={`${iconSource}.svg`}
          alt={label}
          width={16}
          height={16}
          className="text-[#333333]"
        />
      )}
      <span className="text-[#333333] text-sm flex-1">{label}</span>
    </button>
  );
}
