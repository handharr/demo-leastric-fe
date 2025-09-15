import {
  FilterType,
  FilterState,
  FilterMetas,
  FilterOption,
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
    options: [],
  },
};

export function deviceFilterDefaultValue(): DeviceFilterState {
  return getDefaultFilters(deviceFilterMeta);
}

export function getDeviceFiltersMeta({
  options,
}: { options?: FilterOption[] } = {}): FilterMetas {
  if (options) {
    deviceFilterMeta.location.options = options;
  }
  return deviceFilterMeta;
}
