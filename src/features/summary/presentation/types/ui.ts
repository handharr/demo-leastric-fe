export interface SummaryCardProps {
  title: string;
  description: string;
  value: string | number;
  unit?: string;
  prefix?: string;
  className?: string;
  children?: React.ReactNode;
}
