"use client";

import { useState } from "react";
import Image from "next/image";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterState {
  location: string;
  subLocation: string;
  detailLocations: string[];
  units: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
}: FilterModalProps) {
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

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-typography-headline">
            Filter
          </h2>
        </div>

        {/* Content */}
        <div className="flex" style={{ maxHeight: "calc(90vh - 200px)" }}>
          {/* Left Panel - Filter Categories */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            {/* Location */}
            <div
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeSection === "location" ? "bg-gray-50" : ""
              }`}
              onClick={() => setActiveSection("location")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-typography-headline">
                    Location
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getSelectedLocationLabel()}
                  </p>
                </div>
                <Image
                  src="/resources/icons/arrow/chevron-right.svg"
                  alt="Arrow"
                  width={16}
                  height={16}
                  className="text-gray-400 w-[16px] h-[16px]"
                />
              </div>
            </div>

            {/* Sub-location */}
            <div
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeSection === "sub-location" ? "bg-gray-50" : ""
              }`}
              onClick={() => setActiveSection("sub-location")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-typography-headline">
                    Sub-location
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getSelectedSubLocationLabel()}
                  </p>
                </div>
                <Image
                  src="/resources/icons/arrow/chevron-right.svg"
                  alt="Arrow"
                  width={16}
                  height={16}
                  className="text-gray-400 w-[16px] h-[16px]"
                />
              </div>
            </div>

            {/* Detail location */}
            <div
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeSection === "detail-location" ? "bg-gray-50" : ""
              }`}
              onClick={() => setActiveSection("detail-location")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-typography-headline">
                    Detail location
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getSelectedDetailLocationLabel()}
                  </p>
                </div>
                <Image
                  src="/resources/icons/arrow/chevron-right.svg"
                  alt="Arrow"
                  width={16}
                  height={16}
                  className="text-gray-400 w-[16px] h-[16px]"
                />
              </div>
            </div>

            {/* Unit */}
            <div
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeSection === "unit" ? "bg-gray-50" : ""
              }`}
              onClick={() => setActiveSection("unit")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-typography-headline">Unit</h3>
                  <p className="text-sm text-gray-500">
                    {getSelectedUnitLabel()}
                  </p>
                </div>
                <Image
                  src="/resources/icons/arrow/chevron-right.svg"
                  alt="Arrow"
                  width={16}
                  height={16}
                  className="text-gray-400 w-[16px] h-[16px]"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Filter Options */}
          <div className="w-1/2 min-h-[400px] overflow-y-auto">
            {activeSection === "location" && (
              <div className="p-4">
                <h3 className="font-medium text-typography-headline mb-4">
                  Location
                </h3>
                <div className="space-y-2">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedLocation === location.id
                          ? "bg-green-50 text-leastric-primary"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedLocation(location.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{location.label}</span>
                        {selectedLocation === location.id && (
                          <Image
                            src="/resources/icons/menu/check.svg"
                            alt="Selected"
                            width={16}
                            height={16}
                            className="text-leastric-primary"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "sub-location" && (
              <div className="p-4">
                <h3 className="font-medium text-typography-headline mb-4">
                  Sub-location
                </h3>
                <div className="space-y-2">
                  {subLocations.map((subLocation) => (
                    <div
                      key={subLocation.id}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedSubLocation === subLocation.id
                          ? "bg-green-50 text-leastric-primary"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedSubLocation(subLocation.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{subLocation.label}</span>
                        {selectedSubLocation === subLocation.id && (
                          <Image
                            src="/resources/icons/menu/check.svg"
                            alt="Selected"
                            width={16}
                            height={16}
                            className="text-leastric-primary"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "detail-location" && (
              <div className="p-4">
                <h3 className="font-medium text-typography-headline mb-4">
                  Detail location
                </h3>
                <div className="space-y-2">
                  {detailLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleDetailLocationToggle(location.id)}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Image
                          src={
                            location.id === "all"
                              ? selectedDetailLocations.length === 0
                                ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                                : "/resources/icons/checkbox/checkbox-default.svg"
                              : selectedDetailLocations.includes(location.id)
                              ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                              : "/resources/icons/checkbox/checkbox-default.svg"
                          }
                          alt={
                            (location.id === "all" &&
                              selectedDetailLocations.length === 0) ||
                            (location.id !== "all" &&
                              selectedDetailLocations.includes(location.id))
                              ? "Selected"
                              : "Not selected"
                          }
                          width={20}
                          height={20}
                        />
                      </div>
                      <span className="text-sm text-typography-headline">
                        {location.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "unit" && (
              <div className="p-4">
                <h3 className="font-medium text-typography-headline mb-4">
                  Unit
                </h3>
                <div className="space-y-2">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleUnitToggle(unit.id)}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Image
                          src={
                            unit.id === "all"
                              ? selectedUnits.length === 0
                                ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                                : "/resources/icons/checkbox/checkbox-default.svg"
                              : selectedUnits.includes(unit.id)
                              ? "/resources/icons/checkbox/checkbox-default-selected.svg"
                              : "/resources/icons/checkbox/checkbox-default.svg"
                          }
                          alt={
                            (unit.id === "all" && selectedUnits.length === 0) ||
                            (unit.id !== "all" &&
                              selectedUnits.includes(unit.id))
                              ? "Selected"
                              : "Not selected"
                          }
                          width={20}
                          height={20}
                        />
                      </div>
                      <span className="text-sm text-typography-headline">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!activeSection && (
              <div className="p-4 h-full flex items-center justify-center">
                <p className="text-gray-500 text-sm">
                  Select a filter category to configure
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-white">
          <button
            onClick={handleReset}
            className="text-leastric-primary font-medium hover:text-green-700 transition-colors"
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-typography-headline font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 bg-leastric-primary text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
