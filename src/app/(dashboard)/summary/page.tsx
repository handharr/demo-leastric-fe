"use client";

import { SummaryCard } from "@/features/summary/presentation/components/summary-card";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Summary</h1>
      </div>

      {/* Summary Cards Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 md:grid md:grid-cols-2 xl:grid-cols-4 min-w-max md:min-w-0 md:items-stretch">
          {/* Electricity Usage Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="This Month's Est. Usage"
              description="Est. total electricity usage month to date"
              value="172,45"
              unit="kWh"
              className="md:flex-1"
            />
          </div>

          {/* Bill Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="This Month's Est. Bill"
              description="Est. total Bill month to date"
              value="292.993"
              prefix="Rp"
              className="md:flex-1"
            />
          </div>

          {/* CO2 Emission Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="Total CO₂ Emission"
              description="Est. total CO₂ Emission month to date"
              value="24.523"
              unit="kg CO₂e/kWh"
              className="md:flex-1"
            />
          </div>

          {/* Device Status Card */}
          <div className="flex-shrink-0 w-80 md:w-auto md:flex">
            <SummaryCard
              title="Check Device Status"
              description="Quickly check the status of a devices"
              value=""
              className="md:flex-1"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    1
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    1
                  </span>
                </div>
              </div>
            </SummaryCard>
          </div>
        </div>
      </div>
    </div>
  );
}
