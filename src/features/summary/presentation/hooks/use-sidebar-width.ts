import { useEffect, useState } from "react";

export function useSidebarWidth() {
  const [sidebarWidth, setSidebarWidth] = useState(0);

  useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector("aside");
      setSidebarWidth(sidebar?.offsetWidth || 0);
    };

    updateSidebarWidth();

    // Listen for resize events
    window.addEventListener("resize", updateSidebarWidth);

    // Use ResizeObserver for sidebar changes
    let resizeObserver: ResizeObserver | null = null;
    const sidebar = document.querySelector("aside");

    if (sidebar && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(updateSidebarWidth);
      resizeObserver.observe(sidebar);
    }

    return () => {
      window.removeEventListener("resize", updateSidebarWidth);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return sidebarWidth;
}
