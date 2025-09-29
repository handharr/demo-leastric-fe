import { ReactNode } from "react";

export default function PrimaryContainer({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="flex flex-col w-full gap-[16px]">{children}</div>;
}
