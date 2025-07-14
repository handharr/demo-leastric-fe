export type GetAllUsersQueryParam = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
  status?: "active" | "inactive";
};
