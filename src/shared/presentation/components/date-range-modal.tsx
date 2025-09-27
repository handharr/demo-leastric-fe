import { Modal } from "@/shared/presentation/components/modal";
import { useState } from "react";
import Image from "next/image";
import { DayPicker, DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";

import "react-day-picker/dist/style.css";
import "@/features/summary/presentation/styles/date-range-modal.css";

interface DateRangeModalProps {
  onClose?: () => void;
  startDate: string;
  endDate: string;
  onApply: (start: Date, end: Date) => void;
}

export function DateRangeModal({
  onClose,
  startDate,
  endDate,
  onApply,
}: DateRangeModalProps) {
  // For demo, use local state for selection. In real use, replace with a calendar picker.
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    from: parseISO(startDate),
    to: parseISO(endDate),
  });

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <>
      <button
        className="border rounded-md px-3 py-1 text-sm flex items-center gap-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Image
          src="/resources/icons/time/calendar.svg"
          alt="Calendar"
          width={16}
          height={16}
        />
        {format(selectedRange?.from || new Date(), "yyyy-MM-dd")} -{" "}
        {format(selectedRange?.to || new Date(), "yyyy-MM-dd")}
      </button>
      <Modal open={open} onClose={handleClose} zValue={51}>
        <div className="p-4 w-auto">
          {/* Replace below with your calendar picker */}
          <div className="flex flex-row">
            <DayPicker
              captionLayout="label"
              mode="range"
              navLayout="around"
              numberOfMonths={2}
              timeZone="Asia/Jakarta"
              selected={selectedRange}
              onSelect={setSelectedRange}
            />
          </div>
          {/* Footer */}
          <div className="flex flex-grow justify-end gap-3 border-t border-t-default-border pt-[16px] mt-[16px]">
            <button
              className="border rounded-lg px-4 py-1 text-typography-headline font-semibold"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="bg-leastric-primary text-white rounded-lg px-4 py-1 text-sm font-semibold"
              onClick={() => {
                if (selectedRange && selectedRange.from && selectedRange.to) {
                  onApply(selectedRange.from, selectedRange.to);
                  handleClose();
                }
              }}
              disabled={
                !selectedRange || !selectedRange.from || !selectedRange.to
              }
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
