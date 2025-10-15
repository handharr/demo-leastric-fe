import { LoginFormData } from "@/features/auth/domain/params/data/login-form-data";
import { LoginResultModel } from "@/features/auth/domain/entities/login-result-model";
import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { ResetPasswordData } from "@/features/auth/domain/params/data/reset-password-data";
import { UserModel } from "@/features/auth/domain/entities/user-model";
import { ResetPasswordModel } from "@/features/auth/domain/entities/reset-password-model";
import { UpdatePasswordModel } from "@/features/auth/domain/entities/auth-model";
import { UpdatePasswordFormData } from "@/features/auth/domain/params/data/auth-form-data";

export interface AuthRepository {
  login({ data }: { data: LoginFormData }): Promise<UserModel | BaseErrorModel>;

  logout(): Promise<boolean | BaseErrorModel>;

  refreshToken({
    token,
  }: {
    token: string;
  }): Promise<LoginResultModel | BaseErrorModel>;

  validateToken({ token }: { token: string }): Promise<boolean>;

  resetPassword({
    params,
  }: {
    params: ResetPasswordData;
  }): Promise<ResetPasswordModel | BaseErrorModel>;

  updatePassword({
    formData,
  }: {
    formData: UpdatePasswordFormData;
  }): Promise<UpdatePasswordModel | BaseErrorModel>;
}
