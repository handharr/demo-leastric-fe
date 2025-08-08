export interface BaseResponse<T> {
  data?: T;
  flash?: {
    type?: string;
    message?: string;
  };
}
