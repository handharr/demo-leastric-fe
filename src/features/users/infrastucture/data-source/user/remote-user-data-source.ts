import { UserDataSource } from "@/features/users/infrastucture/data-source/user/user-data-source";
import { UserModel } from "@/features/users/domain/entities/user/user-model";
import { CreateUserRequest } from "@/features/users/domain/params/request-params/create-user-request-param";
import { UserResponse } from "@/features/users/infrastucture/model/user/user-response";
import { GetUserPathParam } from "@/features/users/domain/params/path-params/get-user-path-param";
import { UpdateUserPathParam } from "@/features/users/domain/params/path-params/update-user-path-param";
import { DeleteUserPathParam } from "@/features/users/domain/params/path-params/delete-user-path-param";
import { GetUserQueryParam } from "@/features/users/domain/params/query-params/get-user-query-param";
import { GetAllUsersQueryParam } from "@/features/users/domain/params/query-params/get-all-user-query-param";
import { CreateUserQueryParam } from "@/features/users/domain/params/query-params/create-user-query-param";
import { UpdateUserQueryParam } from "@/features/users/domain/params/query-params/update-user-query-param";
import { DeleteUserQueryParam } from "@/features/users/domain/params/query-params/delete-user-query-param";
import axios, { AxiosInstance, AxiosError } from "axios";

export class RemoteUserDataSource implements UserDataSource {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async findById(
    pathParams: GetUserPathParam,
    queryParams?: GetUserQueryParam
  ): Promise<UserModel | null> {
    try {
      const response = await this.axiosInstance.get<UserResponse>(
        `/users/${pathParams.id}`,
        { params: queryParams }
      );
      return this.mapResponseToModel(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async findAll(queryParams?: GetAllUsersQueryParam): Promise<UserModel[]> {
    const response = await this.axiosInstance.get<UserResponse[]>("/users", {
      params: queryParams,
    });
    return response.data.map(this.mapResponseToModel);
  }

  async create(
    data: CreateUserRequest,
    queryParams?: CreateUserQueryParam
  ): Promise<UserModel> {
    const response = await this.axiosInstance.post<UserResponse>(
      "/users",
      data,
      { params: queryParams }
    );
    return this.mapResponseToModel(response.data);
  }

  async update(
    pathParams: UpdateUserPathParam,
    data: Partial<UserModel>,
    queryParams?: UpdateUserQueryParam
  ): Promise<UserModel> {
    const response = await this.axiosInstance.put<UserResponse>(
      `/users/${pathParams.id}`,
      data,
      { params: queryParams }
    );
    return this.mapResponseToModel(response.data);
  }

  async delete(
    pathParams: DeleteUserPathParam,
    queryParams?: DeleteUserQueryParam
  ): Promise<void> {
    await this.axiosInstance.delete(`/users/${pathParams.id}`, {
      params: queryParams,
    });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    try {
      const response = await this.axiosInstance.get<UserResponse>(
        `/users/email/${email}`
      );
      return this.mapResponseToModel(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
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

  private isNotFoundError(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 404;
  }
}
