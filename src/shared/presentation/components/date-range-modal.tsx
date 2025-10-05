import { Modal } from "@/shared/presentation/components/modal";
import { useState } from "react";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { DateRange } from "@/shared/domain/entities/shared-models";
import "react-day-picker/dist/style.css";
import "@/features/summary/presentation/styles/date-range-modal.css";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

interface DateRangeModalProps {
  onClose?: () => void;
  dateRange: DateRange;
  onApply: (range: DateRange) => void;
}

export function DateRangeModal({
  onClose,
  dateRange,
  onApply,
}: DateRangeModalProps) {
  // For demo, use local state for selection. In real use, replace with a calendar picker.
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    dateRange
  );

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
        {format(
          optionalValue(dateRange.startDate).orDefault(new Date()),
          "yyyy-MM-dd"
        )}{" "}
        -{" "}
        {format(
          optionalValue(dateRange.endDate).orDefault(new Date()),
          "yyyy-MM-dd"
        )}
      </button>
      <Modal open={open} onClose={handleClose} zValue={51}>
        <div className="w-auto flex flex-col h-full max-h-[500px]">
          {/* Content area that can scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-row">
              <DayPicker
                captionLayout="label"
                mode="range"
                navLayout="around"
                numberOfMonths={2}
                timeZone="Asia/Jakarta"
                disabled={{ after: new Date() }}
                selected={{
                  from: selectedRange?.startDate,
                  to: selectedRange?.endDate,
                }}
                onSelect={(range) => {
                  if (range && range.from && range.to) {
                    setSelectedRange({
                      startDate: range.from,
                      endDate: range.to,
                    });
                  } else {
                    setSelectedRange(undefined);
                  }
                }}
              />
            </div>
          </div>
          {/* Fixed floating footer */}
          <div className="flex-shrink-0 flex justify-end gap-3 border-t border-t-default-border py-[16px] mt-[16px] bg-white">
            <button
              className="border rounded-lg px-4 py-1 text-typography-headline font-semibold cursor-pointer"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="bg-leastric-primary text-white rounded-lg px-4 py-1 text-sm font-semibold cursor-pointer"
              onClick={() => {
                if (
                  selectedRange &&
                  selectedRange.startDate &&
                  selectedRange.endDate
                ) {
                  onApply(selectedRange);
                  handleClose();
                }
              }}
              disabled={
                !selectedRange ||
                !selectedRange.startDate ||
                !selectedRange.endDate
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
