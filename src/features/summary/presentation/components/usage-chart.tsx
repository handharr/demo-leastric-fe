"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { UsageChartProps } from "@/features/summary/presentation/types/ui";
import { CustomTooltip } from "@/features/summary/presentation/components/custom-tooltip";
import { CustomDot } from "@/features/summary/presentation/components/custom-dot-props";

export function UsageChart({
  title = "This Month's Est. Usage",
  description = "This is for description",
  className = "",
  data,
}: UsageChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPeriod, setSelectedPeriod] = useState("Daily");
  const [selectedUnit, setSelectedUnit] = useState("KWh");
  const [compareEnabled, setCompareEnabled] = useState(false);

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Image
              src="/resources/icons/system/calendar.svg"
              alt="Calendar"
              width={16}
              height={16}
              className="opacity-60"
            />
            {selectedPeriod}
          </button>

          {/* Unit Selector */}
          <div className="relative">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <option value="KWh">KWh</option>
              <option value="MWh">MWh</option>
              <option value="GWh">GWh</option>
            </select>
            <Image
              src="/resources/icons/system/chevron-down.svg"
              alt="Dropdown"
              width={16}
              height={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-60"
            />
          </div>
        </div>

        {/* Compare Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Compare vs. last period</span>
          <button
            onClick={() => setCompareEnabled(!compareEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              compareEnabled ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                compareEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="none"
              stroke="#f3f4f6"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: "#6b7280",
              }}
              tickFormatter={(value) => value.toString()}
              domain={[1, 30]}
              type="number"
              scale="linear"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: "#6b7280",
              }}
              domain={[0, 150]}
              tickCount={4}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} unit={selectedUnit} />
              )}
            />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="#059669"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{
                r: 5,
                fill: "#059669",
                stroke: "#059669",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
        <span className="text-sm text-gray-600">This month</span>
      </div>
    </div>
  );
}
