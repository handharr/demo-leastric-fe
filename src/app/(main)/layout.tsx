"use client";

import Image from "next/image";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50">
      {/* Sidebar - Fixed width, full height */}
      <div className="w-[224px] bg-white border-r border-[#dedede] flex flex-col h-full shrink-0">
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
            <div className="bg-white p-[3px] rounded-l-lg shadow-[0px_0px_3px_0px_rgba(7,45,48,0.1),0px_1.5px_1.5px_0px_rgba(7,45,48,0.05)]">
              {/* <BarRight /> */}
            </div>
          </div>
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Dashboard - Active */}
          <div className="bg-[#dff6e9] relative flex items-center gap-2 p-2 rounded-lg mb-1 w-full">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#2a6335] rounded-r" />
            {/* <Dashboard active={true} /> */}
            <span className="font-semibold text-[#2a6335] text-sm flex-1">
              Dashboard
            </span>
          </div>

          {/* Report */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left"
          >
            {/* <IconReport /> */}
            <span className="text-[#333333] text-sm flex-1">Report</span>
          </button>

          {/* Device */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left"
          >
            {/* <Device /> */}
            <span className="text-[#333333] text-sm flex-1">Device</span>
            {/* <ChevronDown /> */}
          </button>

          {/* Appliance */}
          <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left">
            {/* <Electronic /> */}
            <span className="text-[#333333] text-sm flex-1">Appliance</span>
          </button>

          {/* Setting */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 mb-1 text-left"
          >
            {/* <Setting /> */}
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
      <div className="flex-1 flex flex-col h-full">
        {/* Top Navbar */}
        <div className="h-[62px] bg-white border-b border-[#dedede] flex items-center justify-end px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2a6335] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JS</span>
            </div>
            <span className="text-[#333333] text-sm font-medium">
              Jono Sujono
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </div>
    </div>
  );
}
