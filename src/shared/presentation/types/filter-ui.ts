export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterModalProps<TFilterState = unknown> {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: TFilterState) => void;
  onReset: () => void;
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
