export interface ChartDataPoint {
  day: number;
  usage: number;
}

export enum SecondsIntervalOption {
  Ten = "10 seconds",
  Fifteen = "15 seconds",
  Thirty = "30 seconds",
  Sixty = "60 seconds",
}

export interface ElectricUsageRecord {
  no: number;
  date: string;
  usage: number;
  co2: number;
}

export interface RealTimeDataPoint {
  time: string;
  usage: number;
}
