import {
  FilterType,
  FilterState,
  FilterMetas,
} from "@/shared/presentation/types/filter-ui";
import { getDefaultFilters } from "@/shared/utils/helpers/filter-helper";

export interface ReportFilterState extends FilterState {
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
  years: {
    label: "Year",
    type: FilterType.Single,
    defaultValue: "2025",
    singleSelectionConfig: {
      selectedAllLabel: "All years",
      selectedAllId: "all",
    },
    options: [
      { id: "2025", label: "2025" },
      { id: "2024", label: "2024" },
      { id: "2023", label: "2023" },
      { id: "2022", label: "2022" },
      { id: "2021", label: "2021" },
      { id: "2020", label: "2020" },
      { id: "2019", label: "2019" },
    ],
  },
};

export function reportFilterDefaultValue(): ReportFilterState {
  return getDefaultFilters(reportFilterMeta);
}
