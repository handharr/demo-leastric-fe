export interface SidebarMenuItemProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  iconSource?: string;
  isSidebarOpen?: boolean;
  route: string;
}

export enum EmptyDataState {
  EMPTY = "empty",
  LOADING = "loading",
  ERROR = "error",
}

export interface EmptyDataProps {
  message?: string;
  description?: string;
  onRefresh?: () => void;
  refreshLabel?: string;
  state?: EmptyDataState;
}
