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
import { EmptyData } from "@/shared/presentation/components/empty-data";
import { TilePrimary } from "@/shared/presentation/components/tile-primary";
import { Dropdown } from "@/shared/presentation/components/dropdown";
import { RealTimeInterval } from "@/shared/domain/enum/enums";
import {
  getDateStringAfterSubstractingSeconds,
  getLabelFromRealTimeInterval,
  mapUsageDataToRealTimeDataPoints,
} from "@/features/summary/utils/summary-helper";
import { ElectricityUsageModel } from "@/features/summary/domain/entities/summary-models";
import { formatNumberIndonesian } from "@/shared/utils/helpers/number-helpers";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";

const availableIntervals = [
  getLabelFromRealTimeInterval(RealTimeInterval.Ten),
  getLabelFromRealTimeInterval(RealTimeInterval.Fifteen),
  getLabelFromRealTimeInterval(RealTimeInterval.Thirty),
  getLabelFromRealTimeInterval(RealTimeInterval.Sixty),
];

interface RealTimeMonitoringChartProps {
  data: ElectricityUsageModel[];
  className?: string;
  selectedInterval?: RealTimeInterval;
  isLoading?: boolean;
  onIntervalChange?: (interval: RealTimeInterval) => void;
}

export function RealTimeMonitoringChart({
  data,
  className = "",
  selectedInterval,
  isLoading = false,
  onIntervalChange: setSelectedInterval,
}: RealTimeMonitoringChartProps) {
  const isEmpty = !data || data.length === 0;
  const lastData = data.findLast((d) => d.totalKwh !== undefined);
  const currentUsage = formatNumberIndonesian(
    optionalValue(lastData?.totalKwh).orZero(),
    2
  );

  const controlsSection = (
    <div className="flex flex-row items-center justify-between gap-4 mb-6">
      <div className="w-fit">
        <Dropdown
          options={availableIntervals}
          value={getLabelFromRealTimeInterval(
            selectedInterval || RealTimeInterval.Ten
          )}
          onChange={(option) => {
            const interval = parseInt(option) as RealTimeInterval;
            if (setSelectedInterval) {
              setSelectedInterval(interval);
            }
          }}
        />
      </div>

      <div className="text-right">
        <div className="text-2xl font-bold text-typography-headline">
          {currentUsage}
          <span className="text-sm font-normal text-typography-secondary ml-1">
            Kwh
          </span>
        </div>
      </div>
    </div>
  );

  const chartSection = (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={mapUsageDataToRealTimeDataPoints(
            data,
            selectedInterval || RealTimeInterval.Sixty
          )}
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
            dataKey={"usage"}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            tickFormatter={(value) => {
              return formatNumberIndonesian(value, 0);
            }}
          />
          <Tooltip
            content={(props) => (
              <CustomTooltip
                titles={["Usage"]}
                timeUnit={getDateStringAfterSubstractingSeconds(
                  new Date(),
                  props.payload[0].time as unknown as number
                )}
              />
            )}
          />
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
      {isLoading && isEmpty ? (
        <LoadingSpinner />
      ) : !isLoading && isEmpty ? (
        <EmptyData />
      ) : (
        chartSection
      )}
    </>
  );

  return (
    <TilePrimary
      title="Real-Time Monitoring"
      description="Track your electricity usage in real-time"
      className={className}
    >
      {contents}
    </TilePrimary>
  );
}
