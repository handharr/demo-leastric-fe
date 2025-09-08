"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FilterModalPropsNew,
  FilterType,
  FilterState,
  FilterMetas,
} from "@/shared/presentation/types/filter-ui";
import { SingleSelectSection } from "@/shared/presentation/components/filter/single-select-section";
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
import { MultiSelectSection } from "@/shared/presentation/components/filter/multi-select-section";

export interface DeviceFilterState extends FilterState {
  singleSelection: {
    location: string;
  };
}

export const deviceFilterMeta: FilterMetas = {
  location: {
    label: "Location",
    type: FilterType.Single,
    defaultValue: "all",
    singleSelectionConfig: {
      selectedAllLabel: "All locations",
      selectedAllId: "all",
    },
    options: [
      { id: "all", label: "All locations" },
      { id: "location-a", label: "Location A" },
      { id: "location-b", label: "Location B" },
      { id: "location-c", label: "Location C" },
      { id: "location-d", label: "Location D" },
      { id: "location-e", label: "Location E" },
    ],
  },
};

export function deviceFilterDefaultValue(): DeviceFilterState {
  return getDefaultFilters(deviceFilterMeta);
}

export function DeviceFilterModal({
  currentState,
  onClose,
  onApply,
  onReset,
}: FilterModalPropsNew<DeviceFilterState>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<DeviceFilterState>(
    currentState ?? deviceFilterDefaultValue()
  );
  const [activeSection, setActiveSection] = useState<keyof FilterMetas | null>(
    null
  );

  const hasActiveDeviceFilters = hasActiveFilters({
    filters: filter,
    meta: deviceFilterMeta,
  });

  useEffect(() => {
    setFilter(currentState ?? deviceFilterDefaultValue());
  }, [currentState]);

  const handleApply = useCallback(() => {
    onApply(filter);
    onClose?.();
    setIsOpen(false);
  }, [filter, onApply, onClose]);

  const handleReset = useCallback(() => {
    setFilter(deviceFilterDefaultValue());
    setActiveSection(null);
    onReset(deviceFilterDefaultValue());
  }, [onReset]);

  const handleOpen = useCallback(() => {
    setFilter(currentState ?? deviceFilterDefaultValue());
    setIsOpen(true);
  }, [currentState]);

  const handleClose = useCallback(() => {
    setFilter(currentState ?? deviceFilterDefaultValue());
    setIsOpen(false);
    onClose?.();
  }, [onClose, currentState]);

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
      {/* Filters Category Section */}
      {Object.entries(deviceFilterMeta).map(([filterKey, meta]) => (
        <FilterCategoryItem
          key={filterKey}
          filterKey={filterKey}
          meta={meta}
          options={meta.options}
          active={activeSection === filterKey}
          onClick={() => setActiveSection(filterKey)}
          showBottomBorder={false}
          filterState={filter}
        />
      ))}
    </div>
  );

  const rightContent = (
    <>
      {Object.entries(deviceFilterMeta).map(([filterKey, meta]) =>
        activeSection === filterKey && meta.type === FilterType.Multi ? (
          <MultiSelectSection<DeviceFilterState>
            key={filterKey}
            filterKey={filterKey as keyof DeviceFilterState["multiSelection"]}
            filters={filter}
            meta={meta}
            options={meta.options}
            onUpdateFilters={(newFilters) => setFilter(newFilters)}
          />
        ) : activeSection === filterKey && meta.type === FilterType.Single ? (
          <SingleSelectSection<DeviceFilterState>
            key={filterKey}
            filterKey={filterKey as keyof DeviceFilterState["singleSelection"]}
            filters={filter}
            meta={meta}
            options={meta.options}
            onUpdateFilters={setFilter}
          />
        ) : null
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
