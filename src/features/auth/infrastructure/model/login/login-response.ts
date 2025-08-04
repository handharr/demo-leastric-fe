export interface LoginResponse {
  success?: boolean;
  token?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  message?: string;
}
