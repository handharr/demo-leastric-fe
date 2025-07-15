import { UserModel } from "@/features/users/domain/entities/user/user-model";
import { GetUserPathParam } from "@/features/users/domain/params/path-params/get-user-path-param";
import { UpdateUserPathParam } from "@/features/users/domain/params/path-params/update-user-path-param";
import { DeleteUserPathParam } from "@/features/users/domain/params/path-params/delete-user-path-param";
import { CreateUserRequestParam } from "@/features/users/domain/params/request-params/create-user-request-param";
import { GetUserQueryParam } from "@/features/users/domain/params/query-params/get-user-query-param";
import { GetAllUsersQueryParam } from "@/features/users/domain/params/query-params/get-all-user-query-param";
import { CreateUserQueryParam } from "@/features/users/domain/params/query-params/create-user-query-param";
import { UpdateUserQueryParam } from "@/features/users/domain/params/query-params/update-user-query-param";
import { DeleteUserQueryParam } from "@/features/users/domain/params/query-params/delete-user-query-param";

export interface UserRepository {
  findById(
    pathParams?: GetUserPathParam,
    queryParams?: GetUserQueryParam
  ): Promise<UserModel | null>;

  findAll(queryParams?: GetAllUsersQueryParam): Promise<UserModel[]>;

  create(
    requestParams?: CreateUserRequestParam,
    queryParams?: CreateUserQueryParam
  ): Promise<UserModel>;

  update(
    pathParams?: UpdateUserPathParam,
    requestParams?: Partial<UserModel>,
    queryParams?: UpdateUserQueryParam
  ): Promise<UserModel>;

  delete(
    pathParams?: DeleteUserPathParam,
    queryParams?: DeleteUserQueryParam
  ): Promise<void>;
}
