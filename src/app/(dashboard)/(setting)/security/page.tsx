"use client";
import { useState, useEffect } from "react";
import {
  ChangePasswordValidator,
  type ChangePasswordFields,
} from "@/features/setting/presentation/validator/change-password-validator";
import { useUpdatePassword } from "@/features/auth/presentation/hooks/use-update-password";
import { UpdatePasswordFormData } from "@/features/auth/domain/params/data/auth-form-data";
import Image from "next/image";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
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
    <div className="flex flex-col gap-[16px] w-full">
      <h2 className="text-xl font-semibold mb-2">Security</h2>

      {/* Show API error if exists */}
      {isError && error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-typography-negative text-sm">{error.message}</p>
        </div>
      )}

      <div className="flex flex-col gap-[8px] w-full">
        {/* Current Password */}
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[4px]">
            <label className="block text-sm font-medium">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                  errors.currentPassword ||
                  (isError && error?.statusCode === 401)
                    ? "border-red-300 focus:ring-red-200"
                    : "focus:ring-brand-primary"
                }`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowCurrent((v) => !v)}
                tabIndex={-1}
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                <Image
                  src={
                    showCurrent
                      ? "/resources/icons/security/eye-closed.svg"
                      : "/resources/icons/security/eye-open.svg"
                  }
                  alt={showCurrent ? "Hide password" : "Show password"}
                  width={20}
                  height={20}
                  className="text-gray-400 hover:text-gray-600 w-[20px] h-[20px]"
                />
              </button>
            </div>
          </div>
        </div>
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
        )}
        {/* Show current password error from API */}
        {isError && error?.statusCode === 401 && (
          <p className="text-red-500 text-sm mt-1">
            Current password is incorrect
          </p>
        )}
      </div>

      {/* Forgot password */}
      <div>
        <a
          href="#"
          className="text-brand-primary text-sm font-medium hover:underline whitespace-nowrap"
        >
          Forgot Password?
        </a>
      </div>

      {/* New Password */}
      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[4px]">
          <label className="text-sm font-medium">New password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.newPassword
                  ? "border-red-300 focus:ring-red-200"
                  : "focus:ring-brand-primary"
              }`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              <Image
                src={
                  showNew
                    ? "/resources/icons/security/eye-closed.svg"
                    : "/resources/icons/security/eye-open.svg"
                }
                alt={showNew ? "Hide password" : "Show password"}
                width={20}
                height={20}
                className="text-gray-400 hover:text-gray-600 w-[20px] h-[20px]"
              />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-[4px]">
          <label className="text-sm font-medium">Confirm new password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-300 focus:ring-red-200"
                  : "focus:ring-brand-primary"
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              <Image
                src={
                  showConfirm
                    ? "/resources/icons/security/eye-closed.svg"
                    : "/resources/icons/security/eye-open.svg"
                }
                alt={showConfirm ? "Hide password" : "Show password"}
                width={20}
                height={20}
                className="text-gray-400 hover:text-gray-600 w-[20px] h-[20px]"
              />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <ul className="mt-2 mb-4 space-y-1 text-sm">
        {passwordRules.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-2 ${
              rule.isValid ? "text-brand-primary" : "text-gray-400"
            }`}
          >
            <span>
              {rule.isValid ? (
                <svg width="16" height="16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="#2a6335" />
                  <path
                    d="M5 8.5l2 2 4-4"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="#E5E7EB" />
                  <path
                    d="M5 8.5l2 2 4-4"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {rule.message}
          </li>
        ))}
      </ul>

      <button
        className="cursor-pointer bg-brand-primary text-white px-6 py-2 rounded-md font-semibold disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition w-full sm:w-auto"
        disabled={!isFormValid || isLoading}
        onClick={handleUpdatePassword}
      >
        {isLoading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}
