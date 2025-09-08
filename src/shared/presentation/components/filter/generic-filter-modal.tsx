"use client";

import { useState, useCallback, useEffect } from "react";
import {
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
import { hasActiveFilters } from "@/shared/utils/helpers/filter-helper";
import { MultiSelectSection } from "@/shared/presentation/components/filter/multi-select-section";
import { SingleSelectSection } from "@/shared/presentation/components/filter/single-select-section";

interface GenericFilterModalProps<T extends FilterState> {
  currentState: T;
  onClose?: () => void;
  onApply: (filters: T) => void;
  onReset: (resetValue: T) => void;
  filterMeta: FilterMetas;
  defaultValue: T;
  buttonLabel?: string;
  clearFiltersLabel?: string;
}

export function GenericFilterModal<T extends FilterState>({
  currentState,
  onClose,
  onApply,
  onReset,
  filterMeta,
  defaultValue,
  buttonLabel = "Filter",
  clearFiltersLabel = "Clear Filters",
}: GenericFilterModalProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<T>(currentState ?? defaultValue);
  const [activeSection, setActiveSection] = useState<keyof FilterMetas | null>(
    null
  );

  const hasActiveFiltersValue = hasActiveFilters({
    filters: filter,
    meta: filterMeta,
  });

  useEffect(() => {
    setFilter(currentState ?? defaultValue);
  }, [currentState, defaultValue]);

  const handleApply = useCallback(() => {
    onApply(filter);
    onClose?.();
    setIsOpen(false);
  }, [filter, onApply, onClose]);

  const handleReset = useCallback(() => {
    const resetValue = defaultValue;
    setFilter(resetValue);
    setActiveSection(null);
    onReset(resetValue);
  }, [onReset, defaultValue]);

  const handleOpen = useCallback(() => {
    setFilter(currentState ?? defaultValue);
    setIsOpen(true);
  }, [currentState, defaultValue]);

  const handleClose = useCallback(() => {
    setFilter(currentState ?? defaultValue);
    setIsOpen(false);
    onClose?.();
  }, [onClose, currentState, defaultValue]);

  const filterButton = (
    <div className="flex items-center gap-4">
      <button
        onClick={handleOpen}
        className={clsx(
          "flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold cursor-pointer transition-colors",
          hasActiveFiltersValue
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
        {buttonLabel}
      </button>
      {hasActiveFiltersValue && (
        <button
          className="cursor-pointer text-leastric-primary font-semibold text-sm hover:underline"
          onClick={handleReset}
          type="button"
        >
          {clearFiltersLabel}
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
      {Object.entries(filterMeta).map(([filterKey, meta]) => (
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
      {Object.entries(filterMeta).map(([filterKey, meta]) =>
        activeSection === filterKey && meta.type === FilterType.Multi ? (
          <MultiSelectSection<T>
            key={filterKey}
            filterKey={filterKey}
            filters={filter}
            meta={meta}
            options={meta.options}
            onUpdateFilters={(newFilters) => setFilter(newFilters)}
          />
        ) : activeSection === filterKey && meta.type === FilterType.Single ? (
          <SingleSelectSection<T>
            key={filterKey}
            filterKey={filterKey}
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
