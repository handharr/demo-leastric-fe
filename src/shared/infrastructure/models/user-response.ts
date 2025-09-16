export interface UserResponse {
  id?: number;
  email?: string;
  name?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUserResponse {
  user: UserResponse;
}
