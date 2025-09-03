import { UpdatePasswordDto } from "@/features/auth/infrastructure/params/auth-dto";
import { UpdatePasswordFormData } from "@/features/auth/domain/params/data/auth-form-data";

export const mapUpdatePasswordFormDataToDto = (
  formData: UpdatePasswordFormData
): UpdatePasswordDto => {
  return {
    currentPassword: formData.currentPassword,
    newPassword: formData.newPassword,
    confirmPassword: formData.confirmPassword,
  };
};
