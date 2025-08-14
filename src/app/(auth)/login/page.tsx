"use client";

import { useState } from "react";
import { useLoginForm } from "@/features/auth/presentation/hooks/use-login-form";
import { cn } from "@/lib/utils";
import { ErrorMessage } from "@/shared/presentation/components/error-message";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const { formData, errors, isLoading, updateField, handleSubmit, clearError } =
    useLoginForm(
      undefined, // use default LoginUseCase
      () => router.push("/") // callback for successful login
    );

  return (
    <>
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/resources/images/logo/leastric-logo.svg"
            alt="Leastric"
            width={160}
            height={40}
            className="h-10 w-auto"
          />
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Login</h2>
            <p className="text-gray-600 mt-2">
              Enter your credentials Leastric account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2",
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                )}
                placeholder={errors.email ? "" : "Enter your email"}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Enter your password"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 pr-10",
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Image
                    src={
                      showPassword
                        ? "/resources/icons/security/eye-closed.svg"
                        : "/resources/icons/security/eye-open.svg"
                    }
                    alt={showPassword ? "Hide password" : "Show password"}
                    width={20}
                    height={20}
                    className="text-gray-400 hover:text-gray-600"
                  />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                isLoading
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-leastric-primary text-white hover:bg-green-700"
              )}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-leastric-primary hover:text-leastric-primary/80 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {errors.other && (
              <ErrorMessage
                message={errors.other}
                dismissible={true}
                onDismiss={() => clearError("other")}
              />
            )}
          </form>
        </div>
      </div>
    </>
  );
}
