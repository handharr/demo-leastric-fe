"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useUser } from "@/shared/presentation/hooks/user-context";
import { Logger } from "@/shared/utils/logger/logger";
import { useLogout } from "@/features/auth/presentation/hooks/use-logout";
import {
  PopupType,
  usePopup,
} from "@/shared/presentation/hooks/top-popup-context";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";

interface SettingMenuItem {
  label: string;
  icon: string;
  route: string;
}

// Menu items for settings sidebar
const MENU_ITEMS: SettingMenuItem[] = [
  {
    label: "Profile",
    icon: "/resources/icons/user/account.svg",
    route: "/profile",
  },
  {
    label: "Security",
    icon: "/resources/icons/security/shield-check.svg",
    route: "/security",
  },
  {
    label: "Customer Support",
    icon: "/resources/icons/menu/question-circle.svg",
    route: "/customer-support",
  },
  {
    label: "Logout",
    icon: "/resources/icons/arrow/logout.svg",
    route: "",
  },
];

const UserProfile = () => {
  const { user: userData } = useUser();

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = userData?.name || "Unknown User";
  const initials = userData?.name ? getInitials(userData.name) : "UN";

  return (
    <div className="flex flex-col items-center gap-2 pb-[16px]">
      <div className="w-16 h-16 rounded-full bg-[#E6F4EA] flex items-center justify-center text-2xl font-semibold text-[#2a6335]">
        {initials}
      </div>
      <div className="text-base font-semibold text-gray-800">{displayName}</div>
      <div className="text-sm text-gray-500">{userData?.email}</div>
    </div>
  );
};

export default function SettingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { showPopup } = usePopup();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const pathname = usePathname();
  const {
    isLoading: isLoggingOut,
    error: logoutError,
    logout,
    clearError,
  } = useLogout();

  // Sync activeMenu with current path
  useEffect(() => {
    const found = MENU_ITEMS.find((item) => pathname.startsWith(item.route));
    setActiveIndex(found ? MENU_ITEMS.indexOf(found) : 0);
  }, [pathname]);

  const handleMenuClick = useCallback(
    (item: SettingMenuItem) => {
      if (item.label === "Logout") {
        setShowLogoutDialog(true);
        return;
      }
      setActiveIndex(MENU_ITEMS.indexOf(item));
      setShowContent(true); // Show content when menu item is clicked on mobile
      router.push(item.route);
    },
    [router]
  );

  const handleBackToMenu = () => {
    setShowContent(false);
  };

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
    clearError();
  };

  useEffect(() => {
    if (logoutError) {
      Logger.error("Logout failed", logoutError);
      showPopup(`Logout failed: ${logoutError}`, PopupType.ERROR);
      clearError();
    }
  }, [logoutError, showPopup, clearError]);

  return (
    <div className="flex min-h-screen flex-col gap-[16px]">
      <span className="items-center justify-center text-2xl font-bold text-typography-headline">
        Setting
      </span>
      {/* Setting layout and children */}
      <div className="flex bg-neutral-50 gap-[16px] relative">
        {/* Sidebar */}
        <aside
          className={clsx(
            "w-full md:max-w-xs bg-white rounded-xl border border-[#E5E7EB] flex flex-col p-[20px] self-start transition-transform duration-300",
            "md:block md:translate-x-0",
            showContent ? "hidden md:block" : "block"
          )}
        >
          {/* User Info */}
          {<UserProfile />}

          {/* Menu */}
          <nav className="flex flex-col gap-1">
            {MENU_ITEMS.map((item, idx) => (
              <button
                key={item.label}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer text-left transition-colors",
                  idx === activeIndex
                    ? "md:bg-[#E6F4EA] md:text-brand-primary md:font-semibold hover:bg-gray-100 text-typography-headline"
                    : "hover:bg-gray-100 text-typography-headline"
                )}
                onClick={() => handleMenuClick(item)}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={16}
                  height={16}
                  className={clsx(
                    "transition-colors w-[16px] h-[16px]",
                    idx === activeIndex
                      ? "md:filter-none grayscale"
                      : "grayscale"
                  )}
                />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main
          className={clsx(
            "flex-1 flex flex-col transition-transform duration-300",
            "md:block",
            showContent ? "block" : "hidden md:block"
          )}
        >
          {/* Back button for mobile */}
          <div className="md:hidden mb-4">
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="text-sm font-medium">Back to Settings</span>
            </button>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-[20px]">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-8 min-w-[350px] shadow-lg flex flex-col items-center">
            <div className="text-xl font-semibold mb-6 text-gray-800 text-center">
              Are you sure you want to Logout?
            </div>
            <div className="flex gap-4 w-full">
              <button
                className="flex-1 border border-gray-300 rounded-xl py-3 text-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                onClick={handleCancelLogout}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-[#2a6335] rounded-xl py-3 text-lg font-medium text-white hover:bg-[#215027] transition"
                onClick={handleLogout}
              >
                {isLoggingOut ? (
                  <div className="flex justify-center">
                    <LoadingSpinner size="md" className="h-40 w-40" />
                  </div>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
