"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

// Dummy user data for sidebar
const user = {
  name: "Jono Sujono",
  email: "Jonosujono@gmail.com",
};

// Menu items for settings sidebar
const MENU_ITEMS = [
  {
    label: "Profile",
    icon: "/resources/icons/system/user.svg",
  },
  {
    label: "Security",
    icon: "/resources/icons/system/shield-check.svg",
  },
  {
    label: "Access Manager",
    icon: "/resources/icons/system/users.svg",
  },
  {
    label: "Customer Support",
    icon: "/resources/icons/system/question.svg",
  },
  {
    label: "Logout",
    icon: "/resources/icons/system/logout.svg",
  },
];

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex min-h-screen flex-col lg:flex-col">
      <span className="items-center justify-center text-2xl font-bold text-gray-800">
        Setting
      </span>
      {/* Main content will be rendered here */}
      <div className="flex bg-neutral-50 p-6">
        {/* Sidebar */}
        <aside className="w-full max-w-xs bg-white rounded-xl border border-[#E5E7EB] flex flex-col p-6 gap-8 self-start">
          {/* User Info */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#E6F4EA] flex items-center justify-center text-2xl font-semibold text-[#2a6335]">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="text-base font-semibold text-gray-800">
              {user.name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
          {/* Menu */}
          <nav className="flex flex-col gap-1">
            {MENU_ITEMS.map((item, idx) => (
              <button
                key={item.label}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors",
                  idx === activeIndex
                    ? "bg-[#E6F4EA] text-[#2a6335] font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                )}
                onClick={() => setActiveIndex(idx)}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={20}
                  height={20}
                  className={clsx(
                    "transition-colors",
                    idx === activeIndex ? "filter-none" : "grayscale"
                  )}
                />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        {/* Content */}
        <main className="flex-1 flex flex-col px-8 py-2">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 min-h-[400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
