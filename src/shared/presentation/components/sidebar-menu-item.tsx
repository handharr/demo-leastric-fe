import { SidebarMenuItemProps } from "@/shared/presentation/types/ui";
import Image from "next/image";

export default function SidebarMenuItem({
  label,
  isActive = false,
  onClick,
  iconSource,
  isSidebarOpen = false,
}: SidebarMenuItemProps) {
  // Compute common values
  const justifyClass = isSidebarOpen
    ? "justify-center lg:justify-start"
    : "justify-center";
  const textColor = isActive
    ? "text-leastric-primary"
    : "text-typography-headline";
  const fontWeight = isActive ? "font-semibold" : "";

  // Common content JSX
  const content = (
    <>
      {/* Active indicator bars */}
      {isActive && (
        <>
          {!isSidebarOpen && (
            <div className="w-0.5 h-5 bg-leastric-primary rounded-r hidden lg:block" />
          )}
          {isSidebarOpen && (
            <div className="w-0.5 h-5 bg-leastric-primary rounded-r lg:hidden" />
          )}
        </>
      )}

      {/* Icon */}
      {iconSource && (
        <Image
          src={`${iconSource}`}
          alt={label}
          width={16}
          height={16}
          className={
            isActive ? "text-leastric-primary" : "text-typography-headline"
          }
        />
      )}

      {/* Label */}
      {isSidebarOpen && (
        <span className={`${textColor} ${fontWeight} flex-1 hidden lg:block`}>
          {label}
        </span>
      )}
    </>
  );

  const baseClasses = `w-full flex items-center gap-2 p-2 rounded-lg mb-1 ${justifyClass}`;

  if (isActive) {
    return (
      <div className={`${baseClasses} bg-background-brand-subtle relative`}>
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={`${baseClasses} hover:bg-gray-50 text-left cursor-pointer`}
    >
      {content}
    </button>
  );
}
