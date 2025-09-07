export interface FilterState {
  singleSelection?: Record<string, string>;
  multiSelection?: Record<string, string[]>;
}
export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterMeta {
  label: string;
  type: FilterType;
  defaultValue: string | string[];
  multipleSelectionConfig?: {
    selectedAllLabel?: string;
    selectedAllId?: string;
  };
  singleSelectionConfig?: {
    selectedAllLabel?: string;
    selectedAllId?: string;
  };
}

export interface FilterMetas {
  [key: string]: FilterMeta;
}

export enum FilterType {
  Single = "single",
  Multi = "multi",
}
export interface FilterModalPropsNew<TFilterState extends FilterState> {
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
