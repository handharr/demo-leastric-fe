import React from "react";
import Image from "next/image";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({
  className = "",
  placeholder = "Search...",
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div
      className={`flex items-center bg-white rounded-lg border px-3 py-2 max-w-xs gap-[8px] ${className}`}
    >
      <Image
        src="/resources/icons/system/search.svg"
        alt="Search"
        width={16}
        height={16}
        className="w-[16px] h-[16px]"
      />
      <input
        className="w-full outline-none bg-transparent text-gray-700"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {/* Clear Search Button */}
      {value && (
        <button onClick={() => onChange("")} className="cursor-pointer">
          <Image
            src="/resources/icons/menu/close.svg"
            alt="Clear"
            width={12}
            height={12}
            className="w-[12px] h-[12px] object-contain opacity-50 hover:opacity-100"
          />
        </button>
      )}
    </div>
  );
}
