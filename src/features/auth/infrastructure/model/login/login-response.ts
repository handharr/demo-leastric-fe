export interface LoginResponseData {
  user?: {
    id?: number;
    email?: string;
    name?: string;
    phoneNumber?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  tokens?: {
    access_token?: string;
    refresh_token?: string;
  };
}
export interface LoginResponse {
  user?: {
    id?: number;
    email?: string;
    name?: string;
    phoneNumber?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  tokens?: {
    access_token?: string;
    refresh_token?: string;
  };
}
