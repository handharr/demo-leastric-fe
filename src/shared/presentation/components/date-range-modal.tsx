import { Modal } from "@/shared/presentation/components/modal";
import { useState } from "react";
import Image from "next/image";

interface DateRangeModalProps {
  onClose?: () => void;
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
}

export function DateRangeModal({
  onClose,
  startDate,
  endDate,
  onApply,
}: DateRangeModalProps) {
  // For demo, use local state for selection. In real use, replace with a calendar picker.
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [open, setOpen] = useState(false);

  // Simulate calendar UI with two inputs for simplicity
  return (
    <>
      <button
        className="border rounded-md px-3 py-1 text-sm flex items-center gap-2"
        onClick={() => setOpen(!open)}
      >
        <Image
          src="resources/icons/time/calendar.svg"
          alt="Calendar"
          width={16}
          height={16}
        />
        {startDate} - {endDate}
      </button>
      <Modal open={open} onClose={() => onClose?.()}>
        <div className="p-4 w-full">
          <div className="mb-4 font-semibold text-lg">Select Date Range</div>
          {/* Replace below with your calendar picker */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-xs mb-1">Start Date</label>
              <input
                type="text"
                value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
                className="border rounded px-2 py-1 w-32"
                placeholder="1-7-2025"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">End Date</label>
              <input
                type="text"
                value={localEnd}
                onChange={(e) => setLocalEnd(e.target.value)}
                className="border rounded px-2 py-1 w-32"
                placeholder="30-7-2025"
              />
            </div>
          </div>
          <div className="flex flex-grow justify-end gap-3">
            <button
              className="border rounded-lg px-4 py-1 text-typography-headline font-semibold"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-leastric-primary text-white rounded-lg px-4 py-1 text-sm font-semibold"
              onClick={() => {
                onApply(localStart, localEnd);
                onClose?.();
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
