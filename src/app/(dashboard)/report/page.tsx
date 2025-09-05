"use client";

import {
  reportFilterDefaultValue,
  reportFilterMeta,
  ReportFilterModal,
  ReportFilterState,
} from "@/features/setting/presentation/components/report-filter-modal";
import { ActiveFiltersContainer } from "@/shared/presentation/components/filter/active-filters-container";
import { useState } from "react";

export default function ReportPage() {
  const [activeFilters, setActiveFilters] = useState<ReportFilterState>(
    reportFilterDefaultValue()
  );
  return (
    <div className="flex min-h-screen space-y-[16px] flex-col">
      {/* Header */}
      <div className="space-y-[4px]">
        <h1 className="text-2xl font-bold text-typography-headline">Report</h1>
        <span className="text-sm text-typography-secondary">
          By default the data shown is year-to-date
        </span>
      </div>
      {/* Filter and Export Section */}
      <div className="flex items-center justify-between">
        {/* Filter Modal */}
        <ReportFilterModal
          currentState={activeFilters}
          onApply={(newFilters) => setActiveFilters(newFilters)}
          onReset={() => setActiveFilters(reportFilterDefaultValue())}
        />
        {/* Export Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer">
          Download
        </button>
      </div>

      {/* Active Filters */}
      <ActiveFiltersContainer
        filters={activeFilters}
        onChange={setActiveFilters}
        meta={reportFilterMeta}
      />
    </div>
  );
}
