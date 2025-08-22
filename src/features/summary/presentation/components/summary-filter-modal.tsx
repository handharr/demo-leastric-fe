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
import {
  MultiSelectSection,
  getMultiSelectLabel,
} from "@/shared/presentation/components/filter/multi-select-section";
import { FilterCategoryItem } from "@/shared/presentation/components/filter/filter-category-item";
import { FilterNoActiveSection } from "@/shared/presentation/components/filter/filter-no-active-section";
import { FilterModalFooter } from "@/shared/presentation/components/filter/filter-modal-footer";
import { FilterModal } from "@/shared/presentation/components/filter/filter-modal";

export interface SummaryFilterState {
  location: string;
  subLocation: string;
  detailLocations: string[];
  units: string[];
}

const locations: FilterOption[] = [
  { id: "all", label: "All locations" },
  { id: "location-a", label: "Location A" },
  { id: "location-b", label: "Location B" },
  { id: "location-c", label: "Location C" },
  { id: "location-d", label: "Location D" },
  { id: "location-e", label: "Location E" },
];

const subLocations: FilterOption[] = [
  { id: "all", label: "All sub-locations" },
  { id: "sub-location-a", label: "Sub-location A" },
  { id: "sub-location-b", label: "Sub-location B" },
  { id: "sub-location-c", label: "Sub-location C" },
  { id: "sub-location-d", label: "Sub-location D" },
  { id: "sub-location-e", label: "Sub-location E" },
];

const detailLocations: FilterOption[] = [
  { id: "all", label: "All locations" },
  { id: "detail-location-a", label: "Detail location A" },
  { id: "detail-location-b", label: "Detail location B" },
  { id: "detail-location-c", label: "Detail location C" },
  { id: "detail-location-d", label: "Detail location D" },
  { id: "detail-location-e", label: "Detail location E" },
];

const units: FilterOption[] = [
  { id: "all", label: "All unit" },
  { id: "amphere", label: "Amphere" },
  { id: "watt", label: "Watt" },
  { id: "volt", label: "Volt" },
];

export function SummaryFilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
}: FilterModalProps<SummaryFilterState>) {
  const [filter, setFilter] = useState<SummaryFilterState>({
    location: "all",
    subLocation: "all",
    detailLocations: [],
    units: ["watt"],
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSingleSelect = useCallback(
    (key: keyof SummaryFilterState) => (id: string) => {
      setFilter((prev) => ({ ...prev, [key]: id }));
    },
    []
  );

  const handleMultiToggle = useCallback(
    (key: "detailLocations" | "units") => (id: string) => {
      setFilter((prev) => {
        if (id === "all") return { ...prev, [key]: [] };
        const arr = prev[key];
        return {
          ...prev,
          [key]: arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id],
        };
      });
    },
    []
  );

  const handleApply = useCallback(() => {
    onApply(filter);
    onClose();
  }, [filter, onApply, onClose]);

  const handleReset = useCallback(() => {
    const resetValue = {
      location: "all",
      subLocation: "all",
      detailLocations: [],
      units: ["watt"],
    };
    setFilter(resetValue);
    setActiveSection(null);
    onReset(resetValue);
  }, [onReset]);

  if (!isOpen) return null;

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
      <FilterCategoryItem
        title="Sub-location"
        description={getSingleSelectLabel(
          subLocations,
          filter.subLocation,
          "All sub-locations"
        )}
        active={activeSection === "sub-location"}
        onClick={() => setActiveSection("sub-location")}
        showBottomBorder={false}
      />
      <FilterCategoryItem
        title="Detail location"
        description={getMultiSelectLabel(
          detailLocations,
          filter.detailLocations,
          "All detail location",
          "locations"
        )}
        active={activeSection === "detail-location"}
        onClick={() => setActiveSection("detail-location")}
      />
      <FilterCategoryItem
        title="Unit"
        description={getMultiSelectLabel(
          units,
          filter.units,
          "All units",
          "units"
        )}
        active={activeSection === "unit"}
        onClick={() => setActiveSection("unit")}
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
      {activeSection === "sub-location" && (
        <SingleSelectSection
          title="Sub-location"
          options={subLocations}
          selectedId={filter.subLocation}
          onSelect={handleSingleSelect("subLocation")}
        />
      )}
      {activeSection === "detail-location" && (
        <MultiSelectSection
          title="Detail location"
          options={detailLocations}
          selectedIds={filter.detailLocations}
          onToggle={handleMultiToggle("detailLocations")}
          allSelected={filter.detailLocations.length === 0}
        />
      )}
      {activeSection === "unit" && (
        <MultiSelectSection
          title="Unit"
          options={units}
          selectedIds={filter.units}
          onToggle={handleMultiToggle("units")}
          allSelected={filter.units.length === 0}
        />
      )}
      {!activeSection && <FilterNoActiveSection />}
    </>
  );

  const footer = (
    <FilterModalFooter
      onReset={handleReset}
      onClose={onClose}
      onApply={handleApply}
    />
  );

  return (
    <FilterModal
      isOpen={isOpen}
      onClose={onClose}
      leftContent={leftContent}
      rightContent={rightContent}
      footer={footer}
    />
  );
}
