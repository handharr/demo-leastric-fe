export interface FilterOption {
  id: string;
  label: string;
}

export enum FilterType {
  Single = "single",
  Multi = "multi",
}

export interface FilterModalProps<TFilterState = Record<string, unknown>> {
  currentState?: TFilterState;
  onClose?: () => void;
  onApply: (filters: TFilterState) => void;
  onReset: (filters: TFilterState) => void;
}

export interface FilterProps {
  isOpen: boolean;
  onClose: () => void;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  footer: React.ReactNode;
}

export interface FilterCategoryItemProps {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
  className?: string;
  showBottomBorder?: boolean;
}

export interface FilterModalFooterProps {
  onReset: () => void;
  onClose: () => void;
  onApply: () => void;
}

export interface FilterChipProps {
  label?: string;
  value?: React.ReactNode;
  onRemove: () => void;
  className?: string;
}
