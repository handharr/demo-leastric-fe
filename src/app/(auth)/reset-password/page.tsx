"use client";

import { useState, useMemo } from "react";
import { useResetPasswordForm } from "@/features/auth/presentation/hooks/use-reset-password-form";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    formData,
    errors,
    isLoading,
    isSuccess,
    updateField,
    handleSubmit,
    getPasswordRequirements,
  } = useResetPasswordForm();

  const passwordRequirements = useMemo(
    () => getPasswordRequirements(formData.newPassword),
    [formData.newPassword, getPasswordRequirements]
  );

  const isFormValid =
    formData.newPassword &&
    formData.confirmPassword &&
    Object.values(passwordRequirements).every(Boolean) &&
    formData.newPassword === formData.confirmPassword;

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          <span className="text-xl font-bold text-gray-900">LEASTRIC</span>
        </div>

        {/* Success State */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Password successfully set
            </h2>
            <p className="text-gray-600 mt-2">
              {"You'll be redirected to the homepage shortly."}
            </p>
            <p className="text-gray-600">
              If nothing happens,{" "}
              <a href="/login" className="text-green-600 hover:underline">
                click here
              </a>{" "}
              to continue.
            </p>
          </div>

          {/* Loading indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-green-600 rounded-sm flex items-center justify-center">
          <span className="text-white font-bold text-sm">⚡</span>
        </div>
        <span className="text-xl font-bold text-gray-900">LEASTRIC</span>
      </div>

      {/* Reset Password Form */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
          <p className="text-gray-600 mt-2">
            Please enter a new password that meets your security needs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => updateField("newPassword", e.target.value)}
                placeholder="Enter new password"
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 pr-10",
                  errors.newPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-gray-400 hover:text-gray-600">
                  {showNewPassword ? "🙈" : "👁️"}
                </span>
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          {formData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    passwordRequirements.minLength
                      ? "bg-green-600"
                      : "bg-gray-300"
                  )}
                >
                  {passwordRequirements.minLength && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    passwordRequirements.minLength
                      ? "text-green-600"
                      : "text-gray-500"
                  )}
                >
                  Password must at least 8 character minimal
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    passwordRequirements.hasCapital
                      ? "bg-green-600"
                      : "bg-gray-300"
                  )}
                >
                  {passwordRequirements.hasCapital && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    passwordRequirements.hasCapital
                      ? "text-green-600"
                      : "text-gray-500"
                  )}
                >
                  Password must include capital letter
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    passwordRequirements.hasNumber
                      ? "bg-green-600"
                      : "bg-gray-300"
                  )}
                >
                  {passwordRequirements.hasNumber && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    passwordRequirements.hasNumber
                      ? "text-green-600"
                      : "text-gray-500"
                  )}
                >
                  Password must include Number
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    passwordRequirements.hasSpecial
                      ? "bg-green-600"
                      : "bg-gray-300"
                  )}
                >
                  {passwordRequirements.hasSpecial && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    passwordRequirements.hasSpecial
                      ? "text-green-600"
                      : "text-gray-500"
                  )}
                >
                  Password must include special character (*, !, @, #, %)
                </span>
              </div>
            </div>
          )}

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="Re-enter new password"
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 pr-10",
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? "🙈" : "👁️"}
                </span>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={cn(
              "w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
              isLoading || !isFormValid
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            {isLoading ? "Setting password..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
