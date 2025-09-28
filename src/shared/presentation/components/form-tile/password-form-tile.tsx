"use client";

import {
  ChangePasswordValidationError,
  PasswordValidationRule,
} from "@/features/setting/presentation/validator/change-password-validator";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { useState } from "react";
import Image from "next/image";

interface PasswordFormTileProps {
  title?: string;
  currentPassword?: string;
  setCurrentPassword?: (password: string) => void;
  newPassword?: string;
  setNewPassword?: (password: string) => void;
  confirmNewPassword?: string;
  setConfirmNewPassword?: (password: string) => void;
  errorModel?: BaseErrorModel;
  validationErros?: ChangePasswordValidationError;
  isLoading: boolean;
  passwordRules: PasswordValidationRule[];
}

export default function PasswordFormTile({
  title,
  currentPassword = "",
  setCurrentPassword,
  newPassword = "",
  setNewPassword,
  confirmNewPassword = "",
  setConfirmNewPassword,
  errorModel,
  validationErros = undefined,
  isLoading = false,
  passwordRules = [],
}: PasswordFormTileProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-[16px]">
      <h2 className="text-xl font-semibold mb-2">
        {optionalValue(title).orDefault("Security")}
      </h2>

      {/* Show API error if exists */}
      {errorModel && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-typography-negative text-sm">
            {errorModel.message}
          </p>
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
                  validationErros?.currentPassword ||
                  errorModel?.statusCode === 401
                    ? "border-red-300 focus:ring-red-200"
                    : "focus:ring-brand-primary"
                }`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword?.(e.target.value)}
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
        {validationErros?.currentPassword && (
          <p className="text-red-500 text-sm mt-1">
            {validationErros?.currentPassword}
          </p>
        )}
        {/* Show current password error from API */}
        {errorModel?.statusCode === 401 && (
          <p className="text-red-500 text-sm mt-1">
            Current password is incorrect
          </p>
        )}
        {/* Forgot password */}
        <div>
          <a
            href="#"
            className="text-brand-primary text-sm font-medium hover:underline whitespace-nowrap"
          >
            Forgot Password?
          </a>
        </div>
      </div>

      {/* New Password */}
      <div className="flex flex-col gap-[4px]">
        <label className="text-sm font-medium">New password</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
              validationErros?.newPassword
                ? "border-red-300 focus:ring-red-200"
                : "focus:ring-brand-primary"
            }`}
            value={newPassword}
            onChange={(e) => setNewPassword?.(e.target.value)}
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

      {/* Confirm New Password */}
      <div className="flex flex-col gap-[4px]">
        <label className="text-sm font-medium">Confirm new password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
              validationErros?.confirmPassword
                ? "border-red-300 focus:ring-red-200"
                : "focus:ring-brand-primary"
            }`}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword?.(e.target.value)}
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
        {validationErros?.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {validationErros.confirmPassword}
          </p>
        )}
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
    </div>
  );
}
