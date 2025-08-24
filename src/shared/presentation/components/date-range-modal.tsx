import { Modal } from "@/shared/presentation/components/modal";
import { useState } from "react";
import Image from "next/image";
import { DayPicker } from "react-day-picker";

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

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

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
      <Modal open={open} onClose={handleClose}>
        <div className="p-4 w-auto">
          {/* Title */}
          <div className="mb-4 font-semibold text-lg">Select Date Range</div>
          {/* Replace below with your calendar picker */}
          <div className="flex flex-row">
            <DayPicker
              captionLayout="label"
              mode="range"
              navLayout="around"
              numberOfMonths={2}
              required
              timeZone="Asia/Jakarta"
              selected={
                localStart && localEnd
                  ? { from: new Date(localStart), to: new Date(localEnd) }
                  : undefined
              }
              onSelect={(range) => {
                console.log(range);
                if (range?.from && range?.to) {
                  setLocalStart(range.from.toLocaleDateString("en-GB"));
                  setLocalEnd(range.to.toLocaleDateString("en-GB"));
                }
              }}
            />
          </div>
          {/* Footer */}
          <div className="flex flex-grow justify-end gap-3">
            <button
              className="border rounded-lg px-4 py-1 text-typography-headline font-semibold"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="bg-leastric-primary text-white rounded-lg px-4 py-1 text-sm font-semibold"
              onClick={() => {
                onApply(localStart, localEnd);
                handleClose();
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
