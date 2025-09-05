"use-client";

import {
  reportFilterDefaultValue,
  ReportFilterModal,
  ReportFilterState,
} from "@/features/setting/presentation/components/report-filter-modal";
import { useState } from "react";

export default function ReportPage() {
  const [activeFilters, setActiveFilters] = useState<ReportFilterState>(
    reportFilterDefaultValue()
  );
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="mb-[16px]">
        <h1 className="text-2xl font-bold text-typography-headline">Report</h1>
      </div>
      {/* Filter and Export Section */}
      <div className="flex items-center justify-between mb-[16px]">
        {/* Filter Modal */}
        <ReportFilterModal
          currentState={activeFilters}
          onApply={(newFilters) => setActiveFilters(newFilters)}
          onReset={() => setActiveFilters(reportFilterDefaultValue())}
        />
        {/* Export Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 border border-leastric-primary text-leastric-primary rounded-lg text-sm hover:bg-green-50 transition-colors font-semibold cursor-pointer">
          Export
        </button>
      </div>
    </div>
  );
}
