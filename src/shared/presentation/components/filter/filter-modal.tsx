import React from "react";
import { FilterProps } from "@/shared/presentation/types/filter-ui";

export function FilterModal({
  isOpen,
  onClose,
  leftContent,
  rightContent,
  footer,
}: FilterProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-auto">
        <div className="flex" style={{ maxHeight: "calc(90vh - 200px)" }}>
          {/* Left Panel */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            {leftContent}
          </div>
          {/* Right Panel */}
          <div className="w-1/2 min-h-[400px] overflow-y-auto">
            {rightContent}
          </div>
        </div>
        {/* Footer */}
        {footer}
      </div>
    </div>
  );
}
