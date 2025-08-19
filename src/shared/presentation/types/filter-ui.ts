export interface FilterState {
  location: string;
  subLocation: string;
  detailLocations: string[];
  units: string[];
}

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
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
