"use client";

import Image from "next/image";
import { Pagination } from "@/shared/presentation/components/pagination";
import { PaginationModel } from "@/shared/domain/entities/models-interface";
import { useState } from "react";
import { GenericFilterModal } from "@/shared/presentation/components/filter/generic-filter-modal";
import { FilterMetas, FilterType } from "@/shared/presentation/types/filter-ui";
import { getDefaultFilters } from "@/shared/utils/helpers/filter-helper";
import { UserManagementTable } from "@/features/admin-management/presentation/components/user-management-table";

interface UserManagementFilterState {
  singleSelection: {
    company: string;
    status: string;
  };
}

const userManagementFilterMeta: FilterMetas = {
  company: {
    label: "Company",
    type: FilterType.Single,
    defaultValue: "all",
    singleSelectionConfig: {
      selectedAllLabel: "All companies",
      selectedAllId: "all",
    },
    options: [
      { id: "all", label: "All Companies" },
      { id: "company-a", label: "Company A" },
      { id: "company-b", label: "Company B" },
    ],
  },
  status: {
    label: "Status",
    type: FilterType.Single,
    defaultValue: "all",
    singleSelectionConfig: {
      selectedAllLabel: "All statuses",
      selectedAllId: "all",
    },
    options: [
      { id: "all", label: "All Statuses" },
      { id: "active", label: "Active" },
      { id: "inactive", label: "Inactive" },
    ],
  },
};

function getDefaultUserManagementFilters(): UserManagementFilterState {
  return getDefaultFilters(
    userManagementFilterMeta
  ) as UserManagementFilterState;
}

export default function UserManagementPage() {
  const [activeFilters, setActiveFilters] = useState<UserManagementFilterState>(
    getDefaultUserManagementFilters()
  );
  const [search, setSearch] = useState("");
  const pagination: PaginationModel = {
    page: 1,
    itemCount: 10,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    size: 10,
  };

  const mainContent = (
    <>
      {/* User Table */}
      <div>
        <UserManagementTable users={[]} loading={false} />
        {/* Pagination */}
        <Pagination
          model={pagination}
          onPageChange={(page) => {
            console.log(page);
          }}
          onPreviousPage={() => {
            console.log("previous");
          }}
          onNextPage={() => {}}
        />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col gap-[16px] bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-typography-headline">
          User Management
        </h1>
        <button className="bg-brand-primary text-white px-4 py-2 rounded-md transition font-semibold cursor-pointer">
          Create
        </button>
      </div>

      {/* Search Input Container */}
      <div className="flex items-center justify-start gap-[16px]">
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
        {/* Filter Modal */}
        <GenericFilterModal<UserManagementFilterState>
          currentState={activeFilters}
          onApply={setActiveFilters}
          onReset={() => setActiveFilters(getDefaultUserManagementFilters())}
          filterMeta={userManagementFilterMeta}
          defaultValue={getDefaultUserManagementFilters()}
        />
      </div>
      {mainContent}
    </div>
  );
}
