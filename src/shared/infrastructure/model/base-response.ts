export interface BaseResponse<T> {
  data?: T;
  flash?: {
    type?: string;
    message?: string;
  };
  meta?: {
    page?: number;
    take?: number;
    itemCount?: number;
    pageCount?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
  };
}
