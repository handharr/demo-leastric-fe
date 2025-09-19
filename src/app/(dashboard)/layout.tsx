"use client";

import Image from "next/image";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarMenuItem from "@/shared/presentation/components/sidebar-menu-item";
import { SidebarMenuItemProps } from "@/shared/presentation/types/ui";
import { PopupProvider } from "@/shared/presentation/hooks/top-popup-context";
import {
  UserProvider,
  useUser,
} from "@/shared/presentation/hooks/user-context";
import { usePathname } from "next/navigation";
import { AuthHelper } from "@/features/auth/domain/utils/auth-helper";

// Constants - moved outside component to prevent recreation
const MENU_ITEMS: SidebarMenuItemProps[] = [
  {
    label: "Summary",
    iconSource: "/resources/icons/analytic/dashboard.svg",
    route: "/summary",
  },
  {
    label: "Report",
    iconSource: "/resources/icons/analytic/chart-bar-vertical.svg",
    route: "/report",
  },
  {
    label: "Device",
    iconSource: "/resources/icons/device/device.svg",
    route: "/device",
  },
  {
    label: "Setting",
    iconSource: "/resources/icons/system/setting.svg",
    route: "/profile",
  },
];

// Extracted components for better readability
const Logo = ({
  sidebarOpen,
  className,
}: {
  sidebarOpen: boolean;
  className?: string;
}) => (
  <Image
    src={`/resources/images/logo/leastric-logo${
      sidebarOpen ? "" : "-small"
    }.svg`}
    alt="Leastric Logo"
    width={sidebarOpen ? 135 : 20}
    height={30}
    className={`${className} w-[${sidebarOpen ? 135 : 20}px] h-[30px]`}
    priority
  />
);

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
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#2a6335] rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">{initials}</span>
      </div>
      <span className="text-[#333333] text-sm font-medium hidden sm:block">
        {displayName}
      </span>
    </div>
  );
};

const Breadcrumb = ({
  activeMenu,
}: {
  activeMenu: SidebarMenuItemProps | null;
}) => (
  <div className="hidden lg:flex items-center gap-2">
    <span className="text-[#909090] text-sm">Dashboard</span>
    <span className="text-[#909090]">/</span>
    <span className="text-[#909090] text-sm">{activeMenu?.label || ""}</span>
  </div>
);

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<SidebarMenuItemProps | null>(
    null
  );
  const router = useRouter();
  const pathname = usePathname();

  // Sync activeMenu with current path
  useEffect(() => {
    const found = MENU_ITEMS.find((item) => pathname.startsWith(item.route));
    if (!found) {
      const settingRoutes = ["/profile", "/security", "/customer-support"];
      const isSettingRoute = settingRoutes.some((route) =>
        pathname.startsWith(route)
      );
      console.log("Found setting route:", isSettingRoute);
      console.log("Current pathname:", pathname);
      setActiveMenu(isSettingRoute ? MENU_ITEMS[4] : MENU_ITEMS[0]);
    } else {
      setActiveMenu(found);
    }
  }, [pathname]);

  useEffect(() => {
    // Check AuthHelper for authentication status
    if (!AuthHelper.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // Memoized handlers to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleMenuClick = useCallback(
    (item: SidebarMenuItemProps) => {
      setActiveMenu(item);
      router.push(item.route);
    },
    [router]
  );

  // Memoized class strings for performance
  const sidebarClasses = useMemo(
    () => `
    ${
      sidebarOpen
        ? "translate-x-0 w-20 lg:w-60"
        : "-translate-x-full lg:translate-x-0 w-20"
    } 
    fixed lg:static 
    bg-white 
    border-r border-color-default-border 
    flex flex-col 
    h-full 
    shrink-0 
    z-50 
    transition-transform duration-300 ease-in-out
  `,
    [sidebarOpen]
  );

  const mobileMenuButtonClasses = useMemo(
    () => `
    lg:hidden p-1 transition-all duration-300 ease-in-out
    ${
      !sidebarOpen
        ? "opacity-100 translate-x-0 scale-100"
        : "opacity-0 -translate-x-4 scale-95 pointer-events-none"
    }
  `,
    [sidebarOpen]
  );

  const mobileLogo = useMemo(
    () => `
    lg:hidden cursor-pointer transition-all duration-300 ease-in-out delay-75 w-[20px] h-[20px]
    ${
      !sidebarOpen
        ? "opacity-100 translate-x-0 scale-100"
        : "opacity-0 -translate-x-4 scale-95"
    }
  `,
    [sidebarOpen]
  );

  return (
    <UserProvider>
      <PopupProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-neutral-50">
          {/* Sidebar */}
          <aside className={sidebarClasses}>
            {/* Logo Section */}
            <header className="h-16 bg-white border-b border-color-default-border flex items-center p-2 lg:p-3 shrink-0">
              <div className="flex items-center justify-between w-full">
                <Image
                  src="/resources/images/logo/leastric-logo-small.svg"
                  alt="Leastric Logo"
                  width={20}
                  height={30}
                  className="lg:hidden w-[20px] h-[30px]"
                  priority
                />
                <Logo sidebarOpen={sidebarOpen} className="hidden lg:block" />
                <button
                  onClick={toggleSidebar}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <Image
                    src="/resources/icons/system/bar-left.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="w-[20px] h-[20px]"
                  />
                </button>
              </div>
            </header>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-3">
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem
                  key={item.label}
                  label={item.label}
                  isActive={item.label === activeMenu?.label}
                  onClick={() => handleMenuClick(item)}
                  iconSource={item.iconSource}
                  isSidebarOpen={sidebarOpen}
                  route={item.route}
                />
              ))}
            </nav>

            {/* Footer */}
            <footer className="bg-white border-t border-[#dedede] px-4 py-3 shrink-0">
              <p className="text-xs text-[#909090] text-center font-medium">
                ©Leastric Tech, 2025
              </p>
            </footer>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col h-full w-full lg:w-auto relative">
            {/* Mobile Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/75 z-40 lg:hidden"
                onClick={toggleSidebar}
                role="button"
                tabIndex={0}
                aria-label="Close sidebar"
              />
            )}

            {/* Top Navigation Bar */}
            <header className="h-16 bg-white border-b border-[#dedede] flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-30">
              <div className="flex items-center gap-4">
                <button
                  className={mobileMenuButtonClasses}
                  onClick={toggleSidebar}
                  aria-label="Open sidebar"
                >
                  <Image
                    src="/resources/icons/system/bar-left.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="w-[20px] h-[20px]"
                  />
                </button>
                <Image
                  src="/resources/images/logo/leastric-logo-small.svg"
                  alt="Leastric Logo"
                  width={20}
                  height={20}
                  className={mobileLogo}
                />
                <Breadcrumb activeMenu={activeMenu} />
              </div>
              <UserProfile />
            </header>

            {/* Content Area */}
            <section className="flex-1 overflow-auto p-4 lg:p-8 relative z-10">
              {children}
            </section>
          </main>
        </div>
      </PopupProvider>
    </UserProvider>
  );
}
