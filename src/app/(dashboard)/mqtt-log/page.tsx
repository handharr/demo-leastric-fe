"use client";

import Image from "next/image";
import { MqttTable } from "@/features/admin-management/presentation/components/mqtt-table";
import { Pagination } from "@/shared/presentation/components/pagination";
import { useEffect } from "react";
import { useGetMqttLog } from "@/features/admin-management/presentation/hooks/use-get-mqtt-log";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";

export default function MqttLogPage() {
  const { showPopup } = usePopup();
  const {
    logs,
    loading,
    error,
    pagination,
    search,
    nextPage,
    previousPage,
    goToPage,
    setSearch,
    reset,
  } = useGetMqttLog();

  useEffect(() => {
    if (error) {
      showPopup(error, PopupType.ERROR);
      reset();
    }
  }, [error, showPopup, reset]);

  const mainContent = (
    <>
      {/* Device Table */}
      <div>
        <MqttTable logs={logs} loading={loading} />
        {/* Pagination */}
        <Pagination
          model={pagination}
          onPageChange={(page) => {
            goToPage({ page });
          }}
          onPreviousPage={previousPage}
          onNextPage={nextPage}
        />
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-[16px] bg-gray-50">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-typography-headline">
          Monitoring Broker Connection
        </h1>
      </div>

      {/* Search Input Container */}
      <div className="flex items-center justify-between">
        {/* Search Input */}
        <div className="flex-1 flex items-center bg-white rounded-lg border px-3 py-2 max-w-xs gap-[8px]">
          <Image
            src="/resources/icons/system/search.svg"
            alt="Search"
            width={16}
            height={16}
            className="w-[16px] h-[16px]"
          />
          <input
            className="w-full outline-none bg-transparent text-gray-700"
            placeholder="Search device name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Clear Search Button */}
          {search && (
            <button onClick={() => setSearch("")} className="cursor-pointer">
              <Image
                src="/resources/icons/menu/close"
                alt="Clear"
                width={12}
                height={12}
                className="w-[12px] h-[12px] object-contain opacity-50 hover:opacity-100"
              />
            </button>
          )}
        </div>
      </div>
      <div>{mainContent}</div>
    </div>
  );
}
