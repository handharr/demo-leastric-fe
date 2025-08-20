"use client";

import { useState } from "react";
import {
  FilterOption,
  FilterModalProps,
} from "@/shared/presentation/types/filter-ui";
import { SingleSelectSection } from "@/shared/presentation/components/filter/single-select-section";
import { MultiSelectSection } from "@/shared/presentation/components/filter/multi-select-section";
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

export function SummaryFilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
}: FilterModalProps<SummaryFilterState>) {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSubLocation, setSelectedSubLocation] = useState<string>("all");
  const [selectedDetailLocations, setSelectedDetailLocations] = useState<
    string[]
  >([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(["watt"]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Sample data - replace with actual data
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

  const handleDetailLocationToggle = (locationId: string) => {
    if (locationId === "all") {
      setSelectedDetailLocations([]);
      return;
    }
    setSelectedDetailLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleUnitToggle = (unitId: string) => {
    if (unitId === "all") {
      setSelectedUnits([]);
      return;
    }
    setSelectedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleApply = () => {
    onApply({
      location: selectedLocation,
      subLocation: selectedSubLocation,
      detailLocations: selectedDetailLocations,
      units: selectedUnits,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedLocation("all");
    setSelectedSubLocation("all");
    setSelectedDetailLocations([]);
    setSelectedUnits(["watt"]);
    setActiveSection(null);
    onReset();
  };

  const getSelectedLocationLabel = () => {
    const location = locations.find((l) => l.id === selectedLocation);
    return location?.label || "All locations";
  };

  const getSelectedSubLocationLabel = () => {
    const subLocation = subLocations.find((l) => l.id === selectedSubLocation);
    return subLocation?.label || "All sub-locations";
  };

  const getSelectedDetailLocationLabel = () => {
    if (selectedDetailLocations.length === 0) return "All detail location";
    if (selectedDetailLocations.length === 1) {
      const location = detailLocations.find(
        (l) => l.id === selectedDetailLocations[0]
      );
      return location?.label || "All detail location";
    }
    return `${selectedDetailLocations.length} locations selected`;
  };

  const getSelectedUnitLabel = () => {
    if (selectedUnits.length === 0) return "All units";
    if (selectedUnits.length === 1) {
      const unit = units.find((u) => u.id === selectedUnits[0]);
      return unit?.label || "All units";
    }
    return `${selectedUnits.length} units selected`;
  };

  // Left panel content
  const leftContent = (
    <>
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-typography-headline">
          Filter
        </h2>
      </div>
      <FilterCategoryItem
        title="Location"
        description={getSelectedLocationLabel()}
        active={activeSection === "location"}
        onClick={() => setActiveSection("location")}
        showBottomBorder={false}
      />
      <FilterCategoryItem
        title="Sub-location"
        description={getSelectedSubLocationLabel()}
        active={activeSection === "sub-location"}
        onClick={() => setActiveSection("sub-location")}
        showBottomBorder={false}
      />
      <FilterCategoryItem
        title="Detail location"
        description={getSelectedDetailLocationLabel()}
        active={activeSection === "detail-location"}
        onClick={() => setActiveSection("detail-location")}
      />
      <FilterCategoryItem
        title="Unit"
        description={getSelectedUnitLabel()}
        active={activeSection === "unit"}
        onClick={() => setActiveSection("unit")}
        showBottomBorder={false}
      />
    </>
  );

  // Right panel content
  const rightContent = (
    <>
      {activeSection === "location" && (
        <SingleSelectSection
          title="Location"
          options={locations}
          selectedId={selectedLocation}
          onSelect={setSelectedLocation}
        />
      )}
      {activeSection === "sub-location" && (
        <SingleSelectSection
          title="Sub-location"
          options={subLocations}
          selectedId={selectedSubLocation}
          onSelect={setSelectedSubLocation}
        />
      )}
      {activeSection === "detail-location" && (
        <MultiSelectSection
          title="Detail location"
          options={detailLocations}
          selectedIds={selectedDetailLocations}
          onToggle={handleDetailLocationToggle}
          allSelected={selectedDetailLocations.length === 0}
        />
      )}
      {activeSection === "unit" && (
        <MultiSelectSection
          title="Unit"
          options={units}
          selectedIds={selectedUnits}
          onToggle={handleUnitToggle}
          allSelected={selectedUnits.length === 0}
        />
      )}
      {!activeSection && <FilterNoActiveSection />}
    </>
  );

  // Footer content
  const footer = (
    <FilterModalFooter
      onReset={handleReset}
      onClose={onClose}
      onApply={handleApply}
    />
  );

  if (!isOpen) return null;

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
