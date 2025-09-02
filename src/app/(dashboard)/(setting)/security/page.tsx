"use client";
import { useState } from "react";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Password validation rules
  const validations = [
    {
      label: "Password must at least 8 character minimal",
      valid: newPassword.length >= 8,
    },
    {
      label: "Password must include capital letter",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "Password must include Number",
      valid: /\d/.test(newPassword),
    },
    {
      label: "Password must include special character (*, !, @, #, %)",
      valid: /[*!@#%]/.test(newPassword),
    },
  ];

  const isFormValid =
    validations.every((v) => v.valid) &&
    newPassword === confirmPassword &&
    newPassword.length > 0 &&
    currentPassword.length > 0;

  return (
    <div className="flex flex-col gap-[16px] w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-2">Security</h2>
      <div>
        <label className="block text-sm font-medium mb-1">
          Current Password
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={showCurrent ? "text" : "password"}
              className="w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-200"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowCurrent((v) => !v)}
              tabIndex={-1}
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <span>🙈</span> : <span>👁️</span>}
            </button>
          </div>
          <a
            href="#"
            className="text-brand-primary text-sm font-medium ml-2 hover:underline whitespace-nowrap"
          >
            Forgot Password?
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className="w-full border rounded-md px-4 py-2 pr-10 focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <span>🙈</span> : <span>👁️</span>}
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
              className="w-full border rounded-md px-4 py-2 pr-10 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <span>🙈</span> : <span>👁️</span>}
            </button>
          </div>
        </div>
      </div>
      <ul className="mt-2 mb-4 space-y-1 text-sm">
        {validations.map((v, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 ${
              v.valid ? "text-brand-primary" : "text-gray-400"
            }`}
          >
            <span>
              {v.valid ? (
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
            {v.label}
          </li>
        ))}
      </ul>
      <button
        className="bg-brand-primary text-white px-6 py-2 rounded-md font-semibold disabled:bg-gray-200 disabled:text-gray-400 transition"
        disabled={!isFormValid}
      >
        Update Password
      </button>
    </div>
  );
}
