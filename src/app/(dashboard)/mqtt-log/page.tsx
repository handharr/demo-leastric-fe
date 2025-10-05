"use client";

import { MqttTable } from "@/features/admin-management/presentation/components/mqtt-table";
import { Pagination } from "@/shared/presentation/components/pagination";
import { useEffect } from "react";
import { useGetMqttLog } from "@/features/admin-management/presentation/hooks/use-get-mqtt-log";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import { SearchBar } from "@/shared/presentation/components/search-bar/search-bar";

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
        <SearchBar
          className="flex-1"
          placeholder="Search device name"
          value={search}
          onChange={setSearch}
        />
      </div>
      <div>{mainContent}</div>
    </div>
  );
}
