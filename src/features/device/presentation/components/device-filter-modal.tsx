import {
  FilterType,
  FilterState,
  FilterMetas,
} from "@/shared/presentation/types/filter-ui";
import { getDefaultFilters } from "@/shared/utils/helpers/filter-helper";

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
