"use client";

import Image from "next/image";
import { useState } from "react";
import SidebarMenuItem from "@/shared/presentation/components/sidebar-menu-item";
import { SidebarMenuItemProps } from "@/shared/presentation/types/ui";

// Menu items data
const MENU_ITEMS: SidebarMenuItemProps[] = [
  {
    label: "Dashboard",
    isActive: true,
    iconSource: "/resources/icons/system/dashboard",
  },
  {
    label: "Report",
    isActive: false,
    onClick: () => {},
    iconSource: "/resources/icons/system/report",
  },
  {
    label: "Device",
    isActive: false,
    onClick: () => {},
    iconSource: "/resources/icons/system/device",
  },
  {
    label: "Appliance",
    isActive: false,
    onClick: () => {},
    iconSource: "/resources/icons/system/appliance",
  },
  {
    label: "Setting",
    isActive: false,
    onClick: () => {},
    iconSource: "/resources/icons/system/setting",
  },
];

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
        <div className="h-16 bg-white border-b border-[#dedede] flex items-center px-4 shrink-0">
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
          {MENU_ITEMS.map((item, index) => (
            <SidebarMenuItem
              key={index}
              label={item.label}
              isActive={item.isActive}
              onClick={item.onClick}
              iconSource={item.iconSource}
            />
          ))}
        </div>

        {/* Footer/Watermark */}
        <div className="bg-white border-t border-[#dedede] px-4 py-3 shrink-0">
          <p className="text-xs text-[#909090] text-center font-medium">
            ©Leastric Tech, 2025
          </p>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full lg:w-auto relative">
        {/* Mobile Overlay - only show on mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Top Navbar */}
        <div className="h-16 bg-white border-b border-[#dedede] flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-30">
          {/* Mobile Menu Button & Breadcrumb */}
          <div className="flex items-center gap-4">
            <>
              <button
                className={`
                  lg:hidden p-1 transition-all duration-300 ease-in-out
                  ${
                    !sidebarOpen
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 -translate-x-4 scale-95 pointer-events-none"
                  }
                `}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Image
                  src="/resources/icons/system/bar-left.svg"
                  alt="Menu"
                  width={20}
                  height={20}
                />
              </button>
              <Image
                src="/resources/images/logo/leastric-logo-small.svg"
                alt="Menu"
                width={20}
                height={20}
                className={`
                  lg:hidden cursor-pointer transition-all duration-300 ease-in-out delay-75
                    ${
                      !sidebarOpen
                        ? "opacity-100 translate-x-0 scale-100"
                        : "opacity-0 -translate-x-4 scale-95"
                    }
                `}
              />
            </>

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
        <div className="flex-1 overflow-auto p-4 lg:p-8 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
