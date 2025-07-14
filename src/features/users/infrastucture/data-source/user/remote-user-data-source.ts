import { UserDataSource } from "@/features/users/infrastucture/data-source/user/user-data-source";
import { UserModel } from "@/features/users/domain/entities/user/user-model";
import { CreateUserRequest } from "@/features/users/domain/params/request-params/create-user-request-param";
import { UserResponse } from "@/features/users/infrastucture/model/user/user-response";
import { apiClient } from "@/shared/utils/api-client/api-client";
import { GetUserPathParam } from "@/features/users/domain/params/path-params/get-user-path-param";
import { UpdateUserPathParam } from "@/features/users/domain/params/path-params/update-user-path-param";
import { DeleteUserPathParam } from "@/features/users/domain/params/path-params/delete-user-path-param";
import { GetUserQueryParam } from "@/features/users/domain/params/query-params/get-user-query-param";
import { GetAllUsersQueryParam } from "@/features/users/domain/params/query-params/get-all-user-query-param";
import { CreateUserQueryParam } from "@/features/users/domain/params/query-params/create-user-query-param";
import { UpdateUserQueryParam } from "@/features/users/domain/params/query-params/update-user-query-param";
import { DeleteUserQueryParam } from "@/features/users/domain/params/query-params/delete-user-query-param";

export class RemoteUserDataSource implements UserDataSource {
  async findById(
    pathParams: GetUserPathParam,
    queryParams?: GetUserQueryParam
  ): Promise<UserModel | null> {
    try {
      const query = this.buildQueryString(queryParams);
      const response = await apiClient.get<UserResponse>(
        `/users/${pathParams.id}${query}`
      );
      return this.mapResponseToModel(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  async findAll(queryParams?: GetAllUsersQueryParam): Promise<UserModel[]> {
    const query = this.buildQueryString(queryParams);
    const response = await apiClient.get<UserResponse[]>(`/users${query}`);
    return response.map(this.mapResponseToModel);
  }

  async create(
    data: CreateUserRequest,
    queryParams?: CreateUserQueryParam
  ): Promise<UserModel> {
    const query = this.buildQueryString(queryParams);
    const response = await apiClient.post<UserResponse>(`/users${query}`, data);
    return this.mapResponseToModel(response);
  }

  async update(
    pathParams: UpdateUserPathParam,
    data: Partial<UserModel>,
    queryParams?: UpdateUserQueryParam
  ): Promise<UserModel> {
    const query = this.buildQueryString(queryParams);
    const response = await apiClient.put<UserResponse>(
      `/users/${pathParams.id}${query}`,
      data
    );
    return this.mapResponseToModel(response);
  }

  async delete(
    pathParams: DeleteUserPathParam,
    queryParams?: DeleteUserQueryParam
  ): Promise<void> {
    const query = this.buildQueryString(queryParams);
    await apiClient.delete(`/users/${pathParams.id}${query}`);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    try {
      const response = await apiClient.get<UserResponse>(
        `/users/email/${email}`
      );
      return this.mapResponseToModel(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  private mapResponseToModel(response: UserResponse): UserModel {
    if (!response.id || !response.name || !response.email) {
      throw new Error("Invalid user response: missing required fields");
    }

    return {
      id: response.id,
      name: response.name,
      email: response.email,
      createdAt: response.createdAt || new Date(),
      updatedAt: response.updatedAt || new Date(),
      profilePictureUrl: response.profilePictureUrl,
    };
  }

  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return "";

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }
}
