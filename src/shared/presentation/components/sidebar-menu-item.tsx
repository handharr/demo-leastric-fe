import { SidebarMenuItemProps } from "@/shared/presentation/types/ui";
import Image from "next/image";

export default function SidebarMenuItem({
  label,
  isActive = false,
  onClick,
  iconSource,
  isSidebarOpen = false,
}: SidebarMenuItemProps) {
  if (isActive) {
    return (
      <div
        className={`bg-background-brand-subtle relative flex items-center gap-2 p-2 rounded-lg mb-1 w-full ${
          isSidebarOpen ? "justify-center lg:justify-start" : "justify-center"
        }`}
      >
        {!isSidebarOpen && (
          <div className="w-0.5 h-5 bg-leastric-primary rounded-r hidden lg:block" />
        )}
        {isSidebarOpen && (
          <div className="w-0.5 h-5 bg-leastric-primary rounded-r lg:hidden" />
        )}
        {iconSource && (
          <Image
            src={`${iconSource}.svg`}
            alt={label}
            width={16}
            height={16}
            className="text-leastric-primary"
          />
        )}
        {isSidebarOpen && (
          <span className="text-leastric-primary font-semibold flex-1 hidden lg:block">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={`w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left cursor-pointer ${
        isSidebarOpen ? "justify-center lg:justify-start" : "justify-center"
      }`}
    >
      {iconSource && (
        <Image
          src={`${iconSource}.svg`}
          alt={label}
          width={16}
          height={16}
          className="text-text-headline"
        />
      )}
      {isSidebarOpen && (
        <span className="text-text-headline flex-1 hidden lg:block">
          {label}
        </span>
      )}
    </button>
  );
}
