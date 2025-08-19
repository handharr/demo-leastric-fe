interface FilterState {
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
