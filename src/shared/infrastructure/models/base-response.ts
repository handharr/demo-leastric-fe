export interface BaseResponse<T> {
  data?: T;
  flash?: {
    type?: string;
    message?: string;
  };
  meta?: {
    page?: string;
    itemCount?: number;
    pageCount?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
    size?: string;
  };
}
