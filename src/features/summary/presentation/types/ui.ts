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

export interface UsageChartProps {
  title?: string;
  description?: string;
  className?: string;
  data: ChartDataPoint[];
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
