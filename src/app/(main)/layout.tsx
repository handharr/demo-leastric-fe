"use client";

import Image from "next/image";
import { useState } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50">
      {/* Sidebar - Responsive */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 
        fixed lg:static 
        w-60 
        bg-white 
        border-r border-[#dedede] 
        flex flex-col 
        h-full 
        shrink-0 
        z-50 
        transition-transform duration-300 ease-in-out
      `}
      >
        {/* Logo Section */}
        <div className="h-[62px] bg-white border-b border-[#dedede] flex items-center px-4 shrink-0">
          <div className="flex items-center justify-between w-full">
            <Image
              src="/resources/images/logo/leastric-logo.svg"
              alt="Leastric Logo"
              width={135}
              height={30}
              className="h-[30px] w-[135px]"
            />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Image
                src="/resources/icons/system/bar-left.svg"
                alt="Menu"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Dashboard - Active */}
          <div className="bg-[#dff6e9] relative flex items-center gap-2 p-2 rounded-lg mb-1 w-full">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#2a6335] rounded-r" />
            <Image
              src="/resources/icons/menu/category.svg"
              alt="Dashboard"
              width={20}
              height={20}
            />
            <span className="font-semibold text-[#2a6335] text-sm flex-1">
              Dashboard
            </span>
          </div>

          {/* Report */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left"
          >
            <span className="text-[#333333] text-sm flex-1">Report</span>
          </button>

          {/* Device */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left"
          >
            <span className="text-[#333333] text-sm flex-1">Device</span>
          </button>

          {/* Appliance */}
          <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left">
            <span className="text-[#333333] text-sm flex-1">Appliance</span>
          </button>

          {/* Setting */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left"
          >
            <span className="text-[#333333] text-sm flex-1">Setting</span>
          </button>
        </div>

        {/* Footer/Watermark */}
        <div className="bg-white border-t border-[#dedede] px-4 py-3 shrink-0">
          <p className="text-xs text-[#909090] text-center font-medium">
            ©Leastric Tech, 2025
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full lg:w-auto">
        {/* Top Navbar */}
        <div className="h-[62px] bg-white border-b border-[#dedede] flex items-center justify-between px-4 lg:px-6 shrink-0">
          {/* Mobile Menu Button & Breadcrumb */}
          <div className="flex items-center gap-4">
            <Image
              src="/resources/images/logo/leastric-logo-small.svg"
              alt="Menu"
              width={20}
              height={20}
              className="lg:hidden cursor-pointer"
            />
            {!sidebarOpen && (
              <button
                className="lg:hidden p-1"
                onClick={() => setSidebarOpen(true)}
              >
                <Image
                  src="/resources/icons/system/bar-left.svg"
                  alt="Menu"
                  width={20}
                  height={20}
                />
              </button>
            )}

            {/* Logo and Sidebar Toggle Button for Desktop when sidebar is hidden */}
            <div className="flex items-center gap-2">
              {/* Breadcrumb - only show when sidebar is open */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-[#909090] text-sm">Dashboard</span>
                <span className="text-[#909090]">/</span>
                <span className="text-[#909090] text-sm">default</span>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2a6335] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JS</span>
            </div>
            <span className="text-[#333333] text-sm font-medium hidden sm:block">
              Jono Sujono
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
