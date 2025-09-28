"use client";
import { useState, useEffect } from "react";
import {
  ChangePasswordValidator,
  type ChangePasswordFields,
} from "@/features/setting/presentation/validator/change-password-validator";
import { useUpdatePassword } from "@/features/auth/presentation/hooks/use-update-password";
import { UpdatePasswordFormData } from "@/features/auth/domain/params/data/auth-form-data";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import PrimaryContainer from "@/shared/presentation/components/container/primary-container";
import PasswordFormTile from "@/shared/presentation/components/form-tile/password-form-tile";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showPopup } = usePopup();

  // Use the custom hook
  const { error, isLoading, isSuccess, isError, updatePassword, reset } =
    useUpdatePassword();

  // Get validation result
  const fields: ChangePasswordFields = {
    currentPassword,
    newPassword,
    confirmPassword,
  };

  const validationResult = ChangePasswordValidator.validate(fields);
  const { isValid: isFormValid, errors, passwordRules = [] } = validationResult;

  // Handle form submission
  const handleUpdatePassword = async () => {
    if (!isFormValid) return;

    const formData: UpdatePasswordFormData = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    await updatePassword(formData);
  };

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      reset();
      showPopup("Password updated successfully!", PopupType.SUCCESS);
    }
  }, [isSuccess, reset, showPopup]);

  return (
    <PrimaryContainer>
      <PasswordFormTile
        title="Security"
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmNewPassword={confirmPassword}
        setConfirmNewPassword={setConfirmPassword}
        errorModel={isError ? error || undefined : undefined}
        validationErros={errors}
        isLoading={isLoading}
        passwordRules={passwordRules}
      />

      <button
        className="cursor-pointer bg-brand-primary text-white px-6 py-2 rounded-md font-semibold disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition w-full sm:w-auto"
        disabled={!isFormValid || isLoading}
        onClick={handleUpdatePassword}
      >
        {isLoading ? "Updating..." : "Update Password"}
      </button>
    </PrimaryContainer>
  );
}
