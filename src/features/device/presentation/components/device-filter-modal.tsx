"use client";

import { useState, useCallback } from "react";
import {
  FilterOption,
  FilterModalProps,
} from "@/shared/presentation/types/filter-ui";
import { SingleSelectSection } from "@/shared/presentation/components/filter/single-select-section";
import { FilterCategoryItem } from "@/shared/presentation/components/filter/filter-category-item";
import { FilterNoActiveSection } from "@/shared/presentation/components/filter/filter-no-active-section";
import { FilterModalFooter } from "@/shared/presentation/components/filter/filter-modal-footer";
import { FilterModal } from "@/shared/presentation/components/filter/filter-modal";

export interface DeviceFilterState {
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

const getSingleSelectLabel = (
  options: FilterOption[],
  selectedId: string,
  allLabel: string
) => options.find((o) => o.id === selectedId)?.label || allLabel;

export function DeviceFilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
}: FilterModalProps<DeviceFilterState>) {
  const [filter, setFilter] = useState<DeviceFilterState>({
    location: "all",
    subLocation: "all",
    detailLocations: [],
    units: ["watt"],
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSingleSelect = useCallback(
    (key: keyof DeviceFilterState) => (id: string) => {
      setFilter((prev) => ({ ...prev, [key]: id }));
    },
    []
  );

  const handleApply = useCallback(() => {
    onApply(filter);
    onClose();
  }, [filter, onApply, onClose]);

  const handleReset = useCallback(() => {
    setFilter({
      location: "all",
      subLocation: "all",
      detailLocations: [],
      units: ["watt"],
    });
    setActiveSection(null);
    onReset();
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
