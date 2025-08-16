export interface SidebarMenuItemProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  iconSource?: string;
  isSidebarOpen?: boolean;
  route: string;
}
