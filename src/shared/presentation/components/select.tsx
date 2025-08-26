import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "",
  required,
  disabled,
  name,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      const selectedIndex = options.findIndex((v) => v.value === value);
      setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, value, options]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (open) {
      if (e.key === "ArrowDown") {
        setHighlighted((h) => (h + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        setHighlighted((h) => (h - 1 + options.length) % options.length);
      } else if (e.key === "Enter") {
        onChange(options[highlighted].value);
        setOpen(false);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
  }

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700 cursor-pointer ${
          open ? "border-green-700" : ""
        } ${disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""}`}
        readOnly
        required={required}
        value={selectedOption ? selectedOption.label : ""}
        placeholder={placeholder}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-controls={`${name || "select"}-listbox`}
        disabled={disabled}
        name={name}
        tabIndex={0}
      />
      <Image
        src="/resources/icons/arrow/chevron-down.svg"
        alt="Select icon"
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        width={16}
        height={16}
      />
      {open && !disabled && (
        <div
          ref={listRef}
          id={`${name || "select"}-listbox`}
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option, idx) => (
            <div
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              className={`px-4 py-2 cursor-pointer ${
                highlighted === idx ? "bg-green-100" : ""
              } ${
                value === option.value
                  ? "font-semibold text-green-700 flex justify-between items-center"
                  : ""
              }`}
              onMouseEnter={() => setHighlighted(idx)}
              onMouseDown={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
              {value === option.value && (
                <Image
                  src="/resources/icons/arrow/chevron-down.svg"
                  alt="Select icon"
                  className="ml-2 pointer-events-none"
                  width={16}
                  height={16}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
