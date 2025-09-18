"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartDataPoint } from "@/features/summary/presentation/types/ui";
import { EnergyUnit, TimePeriod } from "@/shared/domain/enum/enums";
import { CustomTooltip } from "@/features/summary/presentation/components/custom-tooltip";
import { CustomDot } from "@/features/summary/presentation/components/custom-dot-props";
import { EmptyData } from "@/shared/presentation/components/empty-data";
import { TilePrimary } from "@/shared/presentation/components/tile-primary";
import { Dropdown } from "@/shared/presentation/components/dropdown";
import {
  getTimePeriodPastLabel,
  getTimePeriodCurrentLabel,
} from "@/shared/utils/helpers/enum-helpers";

interface UsageChartProps {
  title?: string;
  description?: string;
  className?: string;
  data: ChartDataPoint[];
  comparedData: ChartDataPoint[];
  selectedPeriod: TimePeriod;
  selectedUnit: EnergyUnit;
  periodOptions?: TimePeriod[];
  unitOptions?: EnergyUnit[];
  onChangePeriod: (period: TimePeriod) => void;
  onChangeUnit: (unit: EnergyUnit) => void;
}

export function UsageChart({
  title = "Electricity Usage",
  description = "Your electricity consumption trends.",
  className = "",
  data,
  comparedData,
  selectedPeriod = TimePeriod.Daily,
  selectedUnit = EnergyUnit.KWH,
  periodOptions = [],
  unitOptions = [],
  onChangePeriod,
  onChangeUnit,
}: UsageChartProps) {
  const [compareEnabled, setCompareEnabled] = useState(false);

  const isEmpty = !data || data.length === 0;

  const controlsSection = (
    <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
      {/* Left Side - Period and Unit Selectors */}
      <div className="grid grid-cols-2 gap-3">
        {/* Period Selector */}
        <Dropdown
          options={periodOptions}
          value={selectedPeriod}
          onChange={onChangePeriod}
        />

        {/* Unit Selector */}
        <Dropdown
          options={unitOptions}
          value={selectedUnit}
          onChange={onChangeUnit}
        />
      </div>

      {/* Right Side - Compare Toggle */}
      <div className="flex items-center justify-between lg:justify-end gap-3">
        <span className="text-sm text-gray-600 flex-shrink-0">
          Compare vs. last period
        </span>
        <button
          onClick={() => setCompareEnabled(!compareEnabled)}
          className={`relative inline-flex cursor-pointer h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
            compareEnabled ? "bg-leastric-primary" : "bg-neutral-disabled"
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
  );

  const chartSection = (
    <div className="h-64 mb-[16px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            content={(props) => {
              const titles = [
                getTimePeriodCurrentLabel(selectedPeriod),
                getTimePeriodPastLabel(selectedPeriod),
              ];
              return (
                <CustomTooltip {...props} unit={selectedUnit} titles={titles} />
              );
            }}
          />
          <Line
            type="linear"
            dataKey="usage"
            data={data}
            stroke="#2a6335"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{
              r: 5,
              fill: "#2a6335",
              stroke: "#2a6335",
              strokeWidth: 2,
            }}
          />
          {compareEnabled && (
            <Line
              type="linear"
              dataKey="usage"
              data={comparedData}
              stroke="#BABABA"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{
                r: 5,
                fill: "#BABABA",
                stroke: "#BABABA",
                strokeWidth: 2,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const legendSection = (
    <div className="flex flex-row items-center gap-[16px]">
      <div className="flex items-center gap-[8px]">
        <div className="w-[20px] h-[20px] bg-leastric-primary rounded-sm"></div>
        <span className="text-sm text-typography-headline">This month</span>
      </div>
      {compareEnabled && (
        <div className="flex items-center gap-[8px]">
          <div className="w-[20px] h-[20px] bg-neutral-shadow-base rounded-sm"></div>
          <span className="text-sm text-typography-headline">Last month</span>
        </div>
      )}
    </div>
  );

  const sections = (
    <>
      {controlsSection}
      {chartSection}
      {legendSection}
    </>
  );

  return (
    <TilePrimary title={title} description={description} className={className}>
      {isEmpty ? <EmptyData /> : sections}
    </TilePrimary>
  );
}
