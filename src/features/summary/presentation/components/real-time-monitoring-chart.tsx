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
import { formatNumberIndonesian } from "@/shared/utils/helpers/number-helpers";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";
import { useGetElectricityUsageRealTime } from "@/features/summary/presentation/hooks/use-get-electricity-usage-real-time";
import { useRef, useEffect, useMemo } from "react";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { useSubscribeRealTimeUsage } from "../hooks/use-subscribe-real-time-usage";

const availableIntervals = [
  getLabelFromRealTimeInterval(RealTimeInterval.Ten),
  getLabelFromRealTimeInterval(RealTimeInterval.Fifteen),
  getLabelFromRealTimeInterval(RealTimeInterval.Thirty),
  getLabelFromRealTimeInterval(RealTimeInterval.Sixty),
];

interface RealTimeMonitoringChartProps {
  className?: string;
}

export function RealTimeMonitoringChart({
  className = "",
}: RealTimeMonitoringChartProps) {
  const { showPopup } = usePopup();
  const {
    periodicData,
    selectedInterval,
    error: electricityUsageRealTimeError,
    loading: isLoading,
    setSelectedInterval,
    fetchElectricityUsage,
    reset: resetElectricityUsageRealTime,
  } = useGetElectricityUsageRealTime();
  const {
    data: realTimeData,
    error: usageRealTimeError,
    loading: isRealTimeLoading,
    subscribe: subscribeToRealTime,
    unsubscribe: unsubscribeFromRealTime,
  } = useSubscribeRealTimeUsage();
  const fetchRealTimeRef = useRef(fetchElectricityUsage);

  useEffect(() => {
    // Subscribe to real-time updates when component mounts
    subscribeToRealTime();
  }, [subscribeToRealTime]);

  // - Unsubscribe from real-time updates when component unmounts
  useEffect(() => {
    return () => {
      unsubscribeFromRealTime();
    };
  }, [unsubscribeFromRealTime]);

  const isEmpty = useMemo(
    () => !periodicData || periodicData.length === 0,
    [periodicData]
  );

  const lastData = useMemo(
    () => periodicData.findLast((d) => d.totalKwh !== undefined),
    [periodicData]
  );

  const currentUsage = useMemo(
    () => formatNumberIndonesian(optionalValue(lastData?.totalKwh).orZero(), 2),
    [lastData]
  );

  useEffect(() => {
    fetchRealTimeRef.current = fetchElectricityUsage;
  }, [fetchElectricityUsage]);

  useEffect(() => {
    if (electricityUsageRealTimeError) {
      showPopup(
        `Error fetching real-time electricity usage: ${electricityUsageRealTimeError.message}`,
        PopupType.ERROR
      );
      resetElectricityUsageRealTime();
    }
  }, [electricityUsageRealTimeError, showPopup, resetElectricityUsageRealTime]);

  const controlsSection = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div className="w-full sm:w-fit">
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

      <div className="text-left sm:text-right">
        <div className="text-xl sm:text-2xl font-bold text-typography-headline">
          {currentUsage}
          <span className="text-sm font-normal text-typography-secondary ml-1">
            Kwh
          </span>
        </div>
      </div>
    </div>
  );

  const chartSection = (
    <div className="h-48 sm:h-full w-full">
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={mapUsageDataToRealTimeDataPoints(
            periodicData,
            selectedInterval || RealTimeInterval.Sixty
          )}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#dedede" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            className="text-xs"
          />
          <YAxis
            dataKey={"usage"}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            tickFormatter={(value) => {
              return formatNumberIndonesian(value, 0);
            }}
          />
          <Tooltip
            content={(props) => {
              if (
                !props.active ||
                !props.payload ||
                props.payload.length === 0
              ) {
                return null;
              }
              const item = props.payload[0].payload.time;
              return (
                <CustomTooltip
                  titles={["Usage"]}
                  active={props.active}
                  payload={props.payload}
                  label={getDateStringAfterSubstractingSeconds(
                    new Date(),
                    item
                  )}
                  timeUnit="Time:"
                />
              );
            }}
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
