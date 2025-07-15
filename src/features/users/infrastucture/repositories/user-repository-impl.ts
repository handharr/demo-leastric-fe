import { UserRepository } from "@/features/users/domain/repositories/user-repository";
import { UserModel } from "@/features/users/domain/entities/user/user-model";
import { UserDataSource } from "@/features/users/infrastucture/data-source/user/user-data-source";
import { GetUserPathParam } from "@/features/users/domain/params/path-params/get-user-path-param";
import { UpdateUserPathParam } from "@/features/users/domain/params/path-params/update-user-path-param";
import { DeleteUserPathParam } from "@/features/users/domain/params/path-params/delete-user-path-param";
import { CreateUserRequestParam } from "@/features/users/domain/params/request-params/create-user-request-param";
import { GetUserQueryParam } from "@/features/users/domain/params/query-params/get-user-query-param";
import { GetAllUsersQueryParam } from "@/features/users/domain/params/query-params/get-all-user-query-param";
import { CreateUserQueryParam } from "@/features/users/domain/params/query-params/create-user-query-param";
import { UpdateUserQueryParam } from "@/features/users/domain/params/query-params/update-user-query-param";
import { DeleteUserQueryParam } from "@/features/users/domain/params/query-params/delete-user-query-param";

export class UserRepositoryImpl implements UserRepository {
  constructor(private dataSource: UserDataSource) {}

  async findById(
    pathParams?: GetUserPathParam,
    queryParams?: GetUserQueryParam
  ): Promise<UserModel | null> {
    if (!pathParams) {
      throw new Error("Path parameters are required for findById");
    }
    return this.dataSource.findById(pathParams, queryParams);
  }

  async findAll(queryParams?: GetAllUsersQueryParam): Promise<UserModel[]> {
    return this.dataSource.findAll(queryParams);
  }

  async create(
    requestParams?: CreateUserRequestParam,
    queryParams?: CreateUserQueryParam
  ): Promise<UserModel> {
    if (!requestParams) {
      throw new Error("Request parameters are required for create");
    }
    return this.dataSource.create(requestParams, queryParams);
  }

  async update(
    pathParams?: UpdateUserPathParam,
    requestParams?: Partial<UserModel>,
    queryParams?: UpdateUserQueryParam
  ): Promise<UserModel> {
    if (!pathParams) {
      throw new Error("Path parameters are required for update");
    }
    if (!requestParams) {
      throw new Error("Request parameters are required for update");
    }
    return this.dataSource.update(pathParams, requestParams, queryParams);
  }

  async delete(
    pathParams?: DeleteUserPathParam,
    queryParams?: DeleteUserQueryParam
  ): Promise<void> {
    if (!pathParams) {
      throw new Error("Path parameters are required for delete");
    }
    return this.dataSource.delete(pathParams, queryParams);
  }
}
