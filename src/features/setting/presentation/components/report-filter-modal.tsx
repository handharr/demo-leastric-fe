"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FilterOption,
  FilterModalPropsNew,
  FilterType,
  FilterState,
  FilterMetas,
} from "@/shared/presentation/types/filter-ui";
import { FilterCategoryItem } from "@/shared/presentation/components/filter/filter-category-item";
import { FilterNoActiveSection } from "@/shared/presentation/components/filter/filter-no-active-section";
import { FilterModalFooter } from "@/shared/presentation/components/filter/filter-modal-footer";
import { FilterModal } from "@/shared/presentation/components/filter/filter-modal";
import Image from "next/image";
import clsx from "clsx";
import {
  getDefaultFilters,
  hasActiveFilters,
} from "@/shared/utils/helpers/filter-helper";
import {
  getMultiSelectLabel,
  MultiSelectSection,
} from "@/shared/presentation/components/filter/multi-select-section";

export interface ReportFilterState extends FilterState {
  multiSelection: {
    devices: string[];
  };
}

export const reportFilterMeta: FilterMetas = {
  devices: {
    label: "Device",
    type: FilterType.Multi,
    defaultValue: ["all"],
    multipleSelectionConfig: {
      selectedAllLabel: "All devices",
      selectedAllId: "all",
    },
  },
};

const filterDevicesOptions: FilterOption[] = [
  { id: "all", label: "All devices" },
  { id: "device-a", label: "Device A" },
  { id: "device-b", label: "Device B" },
  { id: "device-c", label: "Device C" },
  { id: "device-d", label: "Device D" },
  { id: "device-e", label: "Device E" },
];

export function reportFilterDefaultValue(): ReportFilterState {
  return getDefaultFilters(reportFilterMeta);
}

export function ReportFilterModal({
  currentState,
  onClose,
  onApply,
  onReset,
}: FilterModalPropsNew<ReportFilterState>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<ReportFilterState>(
    currentState ?? reportFilterDefaultValue()
  );
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const hasActiveDeviceFilters = hasActiveFilters({
    filters: filter,
    meta: reportFilterMeta,
  });

  useEffect(() => {
    setFilter(currentState ?? reportFilterDefaultValue());
  }, [currentState]);

  const handleApply = useCallback(() => {
    onApply(filter);
    onClose?.();
    setIsOpen(false);
  }, [filter, onApply, onClose]);

  const handleReset = useCallback(() => {
    setFilter(reportFilterDefaultValue());
    setActiveSection(null);
    onReset(reportFilterDefaultValue());
  }, [onReset]);

  const handleOpen = useCallback(() => {
    setFilter(currentState ?? reportFilterDefaultValue());
    setIsOpen(true);
  }, [currentState]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const filterButton = (
    <div className="flex items-center gap-4">
      <button
        onClick={handleOpen}
        className={clsx(
          "flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold cursor-pointer transition-colors",
          hasActiveDeviceFilters
            ? "bg-leastric-primary/10 border-leastric-primary text-leastric-primary"
            : "border-default-border text-typography-headline hover:bg-gray-50"
        )}
      >
        <Image
          src="resources/icons/system/filter.svg"
          alt="Filter"
          width={20}
          height={20}
        />
        Filter
      </button>
      {hasActiveDeviceFilters && (
        <button
          className="cursor-pointer text-leastric-primary font-semibold text-sm hover:underline"
          onClick={handleReset}
          type="button"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  const leftContent = (
    <div>
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-typography-headline">
          Filter
        </h2>
      </div>
      <FilterCategoryItem
        title={reportFilterMeta.devices.label}
        description={getMultiSelectLabel({
          selectedIds: filter.multiSelection.devices || [],
          options: filterDevicesOptions,
          meta: reportFilterMeta.devices,
        })}
        active={activeSection === "devices"}
        onClick={() => setActiveSection("devices")}
        showBottomBorder={false}
      />
    </div>
  );

  const rightContent = (
    <>
      {activeSection === "devices" && (
        <MultiSelectSection<ReportFilterState>
          filterKey="devices"
          filters={filter}
          meta={reportFilterMeta.devices}
          options={filterDevicesOptions}
          onUpdateFilters={(newFilters) => setFilter(newFilters)}
        />
      )}
      {!activeSection && <FilterNoActiveSection />}
    </>
  );

  const footer = (
    <FilterModalFooter
      onReset={handleReset}
      onClose={handleClose}
      onApply={handleApply}
    />
  );

  return (
    <>
      {filterButton}
      {isOpen && (
        <FilterModal
          isOpen={isOpen}
          onClose={handleClose}
          leftContent={leftContent}
          rightContent={rightContent}
          footer={footer}
        />
      )}
    </>
  );
}
