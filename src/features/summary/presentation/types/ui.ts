export interface SummaryCardProps {
  title: string;
  description: string;
  value: string | number;
  unit?: string;
  prefix?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface ChartDataPoint {
  day: number;
  usage: number;
}

export enum EnergyUnit {
  KWH = "KWh",
  MWH = "MWh",
  GWH = "GWh",
}

export interface UsageChartProps {
  title?: string;
  description?: string;
  className?: string;
  data: ChartDataPoint[];
  availableUnits?: EnergyUnit[];
  defaultUnit?: EnergyUnit;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string | number;
  unit?: string;
}

export interface CustomDotProps {
  cx?: number;
  cy?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  r?: number;
}

export interface ElectricUsageRecord {
  no: number;
  date: string;
  usage: number;
  co2: number;
}

export interface ElectricUsageHistoryTableProps {
  data: ElectricUsageRecord[];
  showAll?: boolean;
  onShowMore?: () => void;
}

export interface RealTimeDataPoint {
  time: string;
  usage: number;
}

export interface RealTimeMonitoringChartProps {
  data: RealTimeDataPoint[];
  currentUsage: number;
  refreshInterval?: number;
}
