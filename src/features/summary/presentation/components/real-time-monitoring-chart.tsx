import {
  CustomTooltip,
  CustomToolTipPayload,
  CustomToolTipTextColor,
} from "@/features/summary/presentation/components/custom-tooltip";
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
  getLabelFromRealTimeInterval,
  getSecondsSubstractedFromNow,
} from "@/features/summary/utils/summary-helper";
import { formatNumberIndonesian } from "@/shared/utils/helpers/number-helpers";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";
import { useRef, useEffect, useMemo } from "react";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { useGetDevicesCurrentMqttLog } from "@/features/summary/presentation/hooks/use-get-devices-current-mqtt-log";

const availableIntervals = [
  getLabelFromRealTimeInterval(RealTimeInterval.Ten),
  getLabelFromRealTimeInterval(RealTimeInterval.Fifteen),
  getLabelFromRealTimeInterval(RealTimeInterval.Thirty),
  getLabelFromRealTimeInterval(RealTimeInterval.Sixty),
];

interface RealTimeMonitoringChartProps {
  className?: string;
  location?: string;
}

export function RealTimeMonitoringChart({
  className = "",
  location,
}: RealTimeMonitoringChartProps) {
  const { showPopup } = usePopup();
  const {
    error: mqttLogError,
    selectedInterval,
    periodicData: mqttPeriodicData,
    fetch: fetchDevicesCurrentMqttLog,
    setSelectedInterval,
    reset: resetMqttLog,
    resetPeriodicData,
  } = useGetDevicesCurrentMqttLog();
  const fetchRealTimeRef = useRef(fetchDevicesCurrentMqttLog);

  const isEmpty = useMemo(
    () => !mqttPeriodicData || mqttPeriodicData.length === 0,
    [mqttPeriodicData]
  );

  const lastData = useMemo(
    () => mqttPeriodicData.findLast((d) => d.value !== undefined),
    [mqttPeriodicData]
  );

  const currentUsage = useMemo(
    () => formatNumberIndonesian(optionalValue(lastData?.value).orZero(), 2),
    [lastData]
  );

  const yAxisDomain = useMemo(() => {
    if (!mqttPeriodicData || mqttPeriodicData.length === 0) {
      return [0, 100]; // Default domain when no data
    }

    const values = mqttPeriodicData
      .map((d) => d.value)
      .filter((v) => v !== undefined && v !== null)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return [0, 100];
    }

    const median =
      values.length % 2 === 0
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)];

    // Make the median the center, so max should be 2 * median
    const maxValue = Math.max(median * 2, Math.max(...values) + 50);

    return [0, maxValue];
  }, [mqttPeriodicData]);

  useEffect(() => {
    fetchRealTimeRef.current = fetchDevicesCurrentMqttLog;
  }, [fetchDevicesCurrentMqttLog]);

  useEffect(() => {
    if (!selectedInterval) return;

    if (resetPeriodicData) {
      resetPeriodicData();
    }

    // Fetch once immediately
    fetchRealTimeRef.current(location || "");

    const intervalId = setInterval(() => {
      fetchRealTimeRef.current(location || "");
    }, selectedInterval * 1000);

    return () => clearInterval(intervalId);
  }, [selectedInterval, location, resetPeriodicData]);

  useEffect(() => {
    if (mqttLogError) {
      showPopup(
        `Error fetching real-time MQTT log: ${mqttLogError.message}`,
        PopupType.ERROR
      );
      resetMqttLog();
    }
  }, [mqttLogError, showPopup, resetMqttLog]);

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
            watt
          </span>
        </div>
      </div>
    </div>
  );

  const chartSection = (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={mqttPeriodicData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#dedede" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            className="text-xs"
            tickFormatter={(time) => {
              const secondsAgo = getSecondsSubstractedFromNow(time);
              if (secondsAgo === 0) return "Now";
              return `${secondsAgo.toString()}s`;
            }}
          />
          <YAxis
            dataKey="value"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            tickFormatter={(value) => {
              return formatNumberIndonesian(value, 0);
            }}
            domain={yAxisDomain}
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
              const _payload: CustomToolTipPayload[] = props.payload.map(
                (entry) => {
                  return {
                    value: `${formatNumberIndonesian(
                      Number(entry.value),
                      2
                    )} watt`,
                    textColor: CustomToolTipTextColor.primary,
                  };
                }
              );
              const time = new Date(props.label || "");
              // Convert to HH:MM:SS
              const hours = time.getHours().toString().padStart(2, "0");
              const minutes = time.getMinutes().toString().padStart(2, "0");
              const seconds = time.getSeconds().toString().padStart(2, "0");
              const formattedTime = `${hours}:${minutes}:${seconds}`;
              return (
                <CustomTooltip
                  active={props.active}
                  payload={_payload}
                  label={formattedTime}
                  timeUnit="Time:"
                />
              );
            }}
          />
          <Line
            type="linear"
            dataKey="value"
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
      {isEmpty ? (
        <div className="h-[400px] flex items-center justify-center">
          <EmptyData />
        </div>
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
