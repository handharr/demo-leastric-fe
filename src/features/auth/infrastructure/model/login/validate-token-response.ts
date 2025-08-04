export interface ValidateTokenResponse {
  valid?: boolean;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}
