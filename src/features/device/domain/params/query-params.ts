export interface GetAllDevicesQueryParams {
  sortOrder?: "ASC" | "DESC";
  page: number;
  take?: number;
  keyword?: string;
  name?: string;
  size: number;
}
