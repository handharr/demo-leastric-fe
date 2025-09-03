"use client";
import { useState } from "react";
import {
  ChangePasswordValidator,
  type ChangePasswordFields,
} from "@/features/setting/presentation/validator/change-password-validator";
import Image from "next/image";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Get validation result
  const fields: ChangePasswordFields = {
    currentPassword,
    newPassword,
    confirmPassword,
  };

  const validationResult = ChangePasswordValidator.validate(fields);
  const { isValid: isFormValid, errors, passwordRules = [] } = validationResult;

  return (
    <div className="flex flex-col gap-[16px] w-full">
      <h2 className="text-xl font-semibold mb-2">Security</h2>
      {/* Current Password and Forgot Password */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Current Password
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={showCurrent ? "text" : "password"}
              className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.currentPassword
                  ? "border-red-300 focus:ring-red-200"
                  : "focus:ring-green-200"
              }`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
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
                className="text-gray-400 hover:text-gray-600"
              />
            </button>
          </div>
          <div className="flex-1">
            <a
              href="#"
              className="text-brand-primary text-sm font-medium ml-2 hover:underline whitespace-nowrap"
            >
              Forgot Password?
            </a>
          </div>
        </div>
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.newPassword
                  ? "border-red-300 focus:ring-red-200"
                  : "focus:ring-green-200"
              }`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
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
                className="text-gray-400 hover:text-gray-600"
              />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Confirm new password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-300 focus:ring-red-200"
                  : "focus:ring-green-200"
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
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
                className="text-gray-400 hover:text-gray-600"
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
        className="cursor-pointer bg-brand-primary text-white px-6 py-2 rounded-md font-semibold disabled:bg-gray-200 disabled:text-gray-400 transition"
        disabled={!isFormValid}
      >
        Update Password
      </button>
    </div>
  );
}
