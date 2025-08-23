"use client";

import { CustomTooltip } from "@/features/summary/presentation/components/custom-tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { RealTimeMonitoringChartProps } from "@/features/summary/presentation/types/ui";
import { EmptyData } from "@/shared/presentation/components/empty-data";
import { TilePrimary } from "@/shared/presentation/components/tile-primary";

export function RealTimeMonitoringChart({
  data,
  currentUsage,
  refreshInterval = 10,
}: RealTimeMonitoringChartProps) {
  const isEmpty = !data || data.length === 0;

  const controlsSection = (
    <div className="flex flex-row items-center justify-between gap-4 mb-6">
      <button className="flex items-center gap-2 px-3 py-2 border border-default-border rounded-lg text-sm text-typography-headline bg-white w-fit">
        <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
        </div>
        {refreshInterval} Seconds
      </button>

      <div className="text-right">
        <div className="text-2xl font-bold text-typography-headline">
          {currentUsage.toFixed(2)}
          <span className="text-sm font-normal text-typography-secondary ml-1">
            Watt
          </span>
        </div>
      </div>
    </div>
  );

  const chartSection = (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#dedede" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            className="text-xs"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            domain={[0, 150]}
            ticks={[0, 50, 100, 150]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="linear"
            dataKey="usage"
            stroke="#2a6335"
            strokeWidth={2}
            activeDot={{ r: 4, fill: "#2a6335" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const contents = (
    <>
      {controlsSection}
      {chartSection}
    </>
  );

  return (
    <TilePrimary
      title="Real-Time Monitoring"
      description="This is for description"
    >
      {isEmpty ? <EmptyData /> : contents}
    </TilePrimary>
  );
}
