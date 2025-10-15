import { AuthRepository } from "@/features/auth/domain/repositories/auth-repository";
import { UpdatePasswordFormData } from "@/features/auth/domain/params/data/auth-form-data";
import { UpdatePasswordModel } from "@/features/auth/domain/entities/auth-model";
import { BaseErrorModel } from "@/core/domain/entities/base-error-model";
import { AuthRepositoryImpl } from "@/features/auth/infrastructure/repositories-implementation/auth-repository-impl";

export class UpdatePasswordUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository = new AuthRepositoryImpl()) {
    this.authRepository = authRepository;
  }

  async execute(
    formData: UpdatePasswordFormData
  ): Promise<UpdatePasswordModel | BaseErrorModel> {
    return await this.authRepository.updatePassword({ formData });
  }
}
