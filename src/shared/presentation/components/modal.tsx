import Image from "next/image";
import { useSidebarWidth } from "@/features/summary/presentation/hooks/use-sidebar-width";
import { useState, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  onClickOutside?: () => void;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  onClickOutside,
}: ModalProps) {
  const sidebarWidth = useSidebarWidth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => {
        if (onClickOutside) {
          onClickOutside();
        }
      }}
      style={{ left: isMobile ? "0px" : `${sidebarWidth}px` }}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-full overflow-auto flex flex-col">
        {title && (
          <div className="flex justify-between p-4 items-center border-b border-gray-100">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">{title}</h2>
              {description && (
                <p className="text-sm text-gray-500 truncate">{description}</p>
              )}
            </div>
            <button
              className="text-gray-400 hover:text-gray-700 cursor-pointer ml-4 flex-shrink-0"
              onClick={onClose}
              aria-label="Close"
            >
              <Image
                src="/resources/icons/menu/close.svg"
                alt="Close"
                width={16}
                height={16}
              />
            </button>
          </div>
        )}
        <div className="px-6 pb-6 pt-4 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
