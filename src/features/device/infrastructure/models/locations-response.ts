export interface DetailLocationResponse {
  detailLocation?: string;
  deviceCount?: number;
}

export interface SubLocationResponse {
  subLocation?: string;
  detailLocations?: DetailLocationResponse[];
  deviceCount?: number;
}

export interface LocationResponse {
  location?: string;
  subLocations?: SubLocationResponse[];
  deviceCount?: number;
}

export interface LocationStatsResponse {
  location?: string;
  subLocations?: string[];
  deviceCount?: number;
  detailLocations?: string[];
}

export interface GetLocationsResponse {
  locations?: string[];
}

export interface GetLocationsWithStatsResponse {
  locations?: LocationStatsResponse[];
}

export interface GetLocationsWithDetailResponse {
  hierarchy?: LocationResponse[];
}
