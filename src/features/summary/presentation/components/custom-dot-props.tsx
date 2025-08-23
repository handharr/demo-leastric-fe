interface CustomDotProps {
  cx?: number;
  cy?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  r?: number;
}

export function CustomDot({
  cx,
  cy,
  fill = "#059669",
  stroke = "#059669",
  strokeWidth = 2,
  r = 3,
}: CustomDotProps) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      className="hover:r-5 transition-all cursor-pointer"
    />
  );
}
