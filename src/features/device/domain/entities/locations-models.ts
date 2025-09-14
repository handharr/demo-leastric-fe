export interface DetailLocationModel {
  detailLocation: string;
  deviceCount: number;
}

export interface SubLocationModel {
  subLocation: string;
  detailLocations: DetailLocationModel[];
  deviceCount: number;
}

export interface LocationModel {
  location: string;
  subLocations: SubLocationModel[];
  deviceCount: number;
}

export interface LocationStatsModel {
  location: string;
  subLocations: string[];
  deviceCount: number;
  detailLocations: string[];
}
