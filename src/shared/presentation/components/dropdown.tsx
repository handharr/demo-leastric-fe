import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface DropdownProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export function Dropdown<T extends string>({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
  disabled = false,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        className={`cursor-pointer flex gap-[8px] items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors ${buttonClassName}`}
        onClick={() => setOpen((v) => !v)}
      >
        {value}
        <Image
          src="/resources/icons/arrow/chevron-down.svg"
          alt="Dropdown"
          width={12}
          height={12}
          className="pointer-events-none opacity-60"
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 min-w-max left-0 bg-white shadow-lg rounded-lg py-1 border border-gray-100">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`flex items-center gap-[12px] w-full px-4 py-2 text-left text-sm text-typography-headline hover:bg-green-50 rounded-lg transition-colors  ${
                value === option ? "bg-green-50" : ""
              }`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <span className="flex-1">{option}</span>
              {value === option && (
                <Image
                  src="/resources/icons/menu/check.svg"
                  alt="Dropdown"
                  width={10}
                  height={10}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
