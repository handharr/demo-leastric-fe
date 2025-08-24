"use client";

import { useState, useCallback } from "react";
import {
  FilterOption,
  FilterModalProps,
} from "@/shared/presentation/types/filter-ui";
import {
  SingleSelectSection,
  getSingleSelectLabel,
} from "@/shared/presentation/components/filter/single-select-section";
import { FilterCategoryItem } from "@/shared/presentation/components/filter/filter-category-item";
import { FilterNoActiveSection } from "@/shared/presentation/components/filter/filter-no-active-section";
import { FilterModalFooter } from "@/shared/presentation/components/filter/filter-modal-footer";
import { FilterModal } from "@/shared/presentation/components/filter/filter-modal";
import Image from "next/image";
import clsx from "clsx";

export interface DeviceFilterState {
  location: string;
  subLocation: string;
  detailLocations: string[];
  units: string[];
  [key: string]: unknown;
}

export function isDefaultFilters(filters: DeviceFilterState) {
  return (
    filters.location === "all" &&
    filters.subLocation === "all" &&
    filters.detailLocations.length === 0 &&
    filters.units.length === 1 &&
    filters.units[0] === "watt"
  );
}

const locations: FilterOption[] = [
  { id: "all", label: "All locations" },
  { id: "location-a", label: "Location A" },
  { id: "location-b", label: "Location B" },
  { id: "location-c", label: "Location C" },
  { id: "location-d", label: "Location D" },
  { id: "location-e", label: "Location E" },
];

const resetValue = {
  location: "all",
  subLocation: "all",
  detailLocations: [],
  units: ["watt"],
};

export function DeviceFilterModal({
  currentState,
  onClose,
  onApply,
  onReset,
}: FilterModalProps<DeviceFilterState>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<DeviceFilterState>(resetValue);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const hasActiveFilters = !isDefaultFilters(filter);

  const handleSingleSelect = useCallback(
    (key: keyof DeviceFilterState) => (id: string) => {
      setFilter((prev) => ({ ...prev, [key]: id }));
    },
    []
  );

  const handleApply = useCallback(() => {
    onApply(filter);
    onClose?.();
    setIsOpen(false);
  }, [filter, onApply, onClose]);

  const handleReset = useCallback(() => {
    setFilter(resetValue);
    setActiveSection(null);
    onReset(resetValue);
  }, [onReset]);

  const handleOpen = useCallback(() => {
    setFilter(currentState ?? resetValue);
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
          hasActiveFilters
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
      {hasActiveFilters && (
        <button
          className="text-leastric-primary font-semibold text-sm hover:underline"
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
        title="Location"
        description={getSingleSelectLabel(
          locations,
          filter.location,
          "All locations"
        )}
        active={activeSection === "location"}
        onClick={() => setActiveSection("location")}
        showBottomBorder={false}
      />
    </div>
  );

  const rightContent = (
    <>
      {activeSection === "location" && (
        <SingleSelectSection
          title="Location"
          options={locations}
          selectedId={filter.location}
          onSelect={handleSingleSelect("location")}
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
