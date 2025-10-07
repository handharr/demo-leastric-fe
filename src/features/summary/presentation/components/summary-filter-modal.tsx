import {
  FilterType,
  FilterState,
  FilterMetas,
  FilterOption,
} from "@/shared/presentation/types/filter-ui";
import { getDefaultFilters } from "@/shared/utils/helpers/filter-helper";

export interface SummaryFilterState extends FilterState {
  singleSelection: {
    location: string;
  };
}

export const summaryFilterMeta: FilterMetas = {
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

export function summaryFilterDefaultValue(): SummaryFilterState {
  return getDefaultFilters(summaryFilterMeta);
}

export function getSummaryFiltersMeta({
  options,
}: { options?: FilterOption[] } = {}): FilterMetas {
  if (options) {
    summaryFilterMeta.location.options = options;
  }
  return summaryFilterMeta;
}
