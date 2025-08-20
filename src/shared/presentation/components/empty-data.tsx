import React from "react";
import Image from "next/image";
import { EmptyDataProps, EmptyDataState } from "@/shared/presentation/types/ui";

const stateConfig = {
  [EmptyDataState.EMPTY]: {
    image: "/resources/images/empty/empty-data.svg",
    alt: "No data",
    defaultMessage: "No data display",
    description: undefined,
  },
  [EmptyDataState.LOADING]: {
    image: "/resources/images/loading/loading-paper.svg",
    alt: "Loading",
    defaultMessage: "Processing data...",
    description: undefined,
  },
  [EmptyDataState.ERROR]: {
    image: "/resources/images/empty/unloaded.svg",
    alt: "Error",
    defaultMessage: "Something went wrong",
    description: "Refresh the page to reload the data",
  },
};

export const EmptyData: React.FC<EmptyDataProps> = ({
  state = EmptyDataState.EMPTY,
  message,
  description,
  onRefresh,
  refreshLabel = "Refresh",
}) => {
  const config = stateConfig[state] || stateConfig[EmptyDataState.EMPTY];
  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-[200px] text-typography-headline"
      data-testid="empty-data"
    >
      <Image
        src={config.image}
        alt={config.alt}
        width={120}
        height={90}
        className="mb-2"
        priority
      />
      <div className="mt-2 text-base font-semibold text-typography-headline text-center">
        {message || config.defaultMessage}
      </div>
      {description && (
        <div className="mt-1 text-sm text-typography-subhead text-center">
          {description || config.description}
        </div>
      )}
      {onRefresh && state !== EmptyDataState.ERROR && (
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1 mt-4 text-leastric-primary hover:underline font-medium cursor-pointer"
        >
          <Image
            src="/resources/icons/arrow/refresh-1.svg"
            alt="Refresh"
            width={12}
            height={12}
          />
          {refreshLabel}
        </button>
      )}
    </div>
  );
};
