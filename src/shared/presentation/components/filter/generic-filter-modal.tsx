"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  FilterType,
  FilterState,
  FilterMetas,
} from "@/shared/presentation/types/filter-ui";
import { FilterCategoryItem } from "@/shared/presentation/components/filter/filter-category-item";
import { FilterNoActiveSection } from "@/shared/presentation/components/filter/filter-no-active-section";
import { FilterModalFooter } from "@/shared/presentation/components/filter/filter-modal-footer";
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
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (!isOpen) {
      setFilter(currentState ?? defaultValue);
    }

    let isHasEmptyOptions = false;
    Object.values(filterMeta).forEach((meta) => {
      if (meta.options.length === 0) {
        isHasEmptyOptions = true;
      }
    });

    if (isHasEmptyOptions) {
      return;
    }

    setIsOpen((isOpen) => !isOpen);
  }, [currentState, defaultValue, isOpen, filterMeta]);

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
          src="/resources/icons/system/filter.svg"
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

  const rightContent = () => {
    if (!activeSection) {
      return (
        <div className="flex-1 h-[400px] flex items-center justify-center">
          <FilterNoActiveSection />
        </div>
      );
    }
    return (
      <div className="flex-1 min-h-[400px] overflow-y-auto">
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
      </div>
    );
  };

  const footer = (
    <FilterModalFooter
      onReset={handleReset}
      onClose={handleClose}
      onApply={handleApply}
    />
  );

  return (
    <div ref={containerRef} className="relative">
      {filterButton}
      {/* Filter container */}
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          {/* Modal content */}
          <div
            className={clsx(
              "bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col max-h-[50vh]",
              // Mobile: fixed center positioning
              "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw]",
              // Desktop: absolute positioning relative to container
              "lg:absolute lg:top-full lg:left-0 lg:mt-2 lg:min-w-[800px] lg:max-w-4xl lg:w-auto lg:h-auto lg:transform-none lg:translate-x-0 lg:translate-y-0"
            )}
          >
            <div className="flex flex-1 overflow-hidden">
              {/* Left sidebar */}
              <div className="flex-1 w-80 border-r border-gray-200 overflow-y-auto">
                {leftContent}
              </div>
              {/* Right content */}
              {rightContent()}
            </div>
            {/* Footer */}
            <div className="border-t border-gray-200 flex-shrink-0">
              {footer}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
