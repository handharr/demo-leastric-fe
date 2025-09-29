import {
  FilterType,
  FilterState,
  FilterMetas,
} from "@/shared/presentation/types/filter-ui";
import { get10YearsRangeFromCurrentYear } from "@/shared/utils/helpers/date-helpers";
import { getDefaultFilters } from "@/shared/utils/helpers/filter-helper";

export interface ReportFilterState extends FilterState {
  singleSelection: {
    year: string;
  };
  multiSelection: {
    devices: string[];
  };
}

export const reportFilterMeta: FilterMetas = {
  devices: {
    label: "Device",
    type: FilterType.Multi,
    defaultValue: ["all"],
    multipleSelectionConfig: {
      selectedAllLabel: "All devices",
      selectedAllId: "all",
    },
    options: [
      { id: "all", label: "All devices" },
      { id: "device-a", label: "Device A" },
      { id: "device-b", label: "Device B" },
      { id: "device-c", label: "Device C" },
      { id: "device-d", label: "Device D" },
      { id: "device-e", label: "Device E" },
    ],
  },
  year: {
    label: "Year",
    type: FilterType.Single,
    defaultValue: new Date().getFullYear().toString(),
    singleSelectionConfig: undefined,
    options: get10YearsRangeFromCurrentYear().map((year) => ({
      id: year,
      label: year,
    })),
  },
};

export function reportFilterDefaultValue(): ReportFilterState {
  return getDefaultFilters(reportFilterMeta);
}
