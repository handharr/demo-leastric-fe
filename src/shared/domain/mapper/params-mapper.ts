import { UpdateUserFormData } from "@/shared/domain/params/data-params";
import { UpdateUserDto } from "@/shared/infrastructure/params/dto";

export const mapUpdateUserFormDataToDto = (
  formData: UpdateUserFormData
): UpdateUserDto => {
  return {
    id: formData.id,
    email: formData.email,
    fullName: formData.fullName,
    phoneNumber: formData.phoneNumber,
    createdAt: formData.createdAt,
    updatedAt: formData.updatedAt,
  };
};
