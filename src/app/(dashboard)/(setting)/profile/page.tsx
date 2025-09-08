"use client";

import { useEffect, useState } from "react";
import { useGetUserDetails } from "@/shared/presentation/hooks/use-get-user-details";
import { useUpdateUserDetails } from "@/shared/presentation/hooks/use-update-user-details";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("Jono Sujono Mangunkusom");
  const [email, setEmail] = useState("Jonosujono@gmail.com");
  const [phone, setPhone] = useState("");
  const { userDetails, loading, error, fetchUserDetails } = useGetUserDetails();
  const {
    updateUserDetails,
    loading: updating,
    error: updateError,
    success,
    resetState,
  } = useUpdateUserDetails();

  useEffect(() => {
    if (userDetails) {
      setFullName(userDetails.name);
      setEmail(userDetails.email);
      setPhone(userDetails.phoneNumber);
    }

    if (success) {
      // Handle success case
      fetchUserDetails();
      resetState();
    }
  }, [userDetails, success, fetchUserDetails, resetState]);

  if (loading) {
    return <LoadingSpinner size="md" className="h-40" />;
  }

  if (error || updateError)
    return (
      <div className="flex justify-center items-center h-40 text-typography-negative">
        {error?.message || updateError?.message}
      </div>
    );

  return (
    <div className="flex flex-col w-full gap-[16px]">
      <h2 className="text-xl font-semibold">Profile</h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-[16px]"
        onSubmit={(e) => {
          e.preventDefault();
          updateUserDetails({
            email,
            fullName: fullName,
            phoneNumber: phone.length > 0 ? phone : undefined,
          });
        }}
      >
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Full Name <span className="text-typography-negative">*</span>
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary border-brand-primary"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            type="text"
            placeholder="Enter your full name"
          />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-typography-negative">*</span>
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary border-brand-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="Enter your email"
          />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary border-brand-primary"
            value={phone}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, "");
              setPhone(onlyNums);
            }}
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="cursor-pointer bg-brand-primary text-white px-8 py-2 rounded-md font-medium hover:bg-brand-primary transition disabled:bg-neutral-disabled"
            disabled={
              updating ||
              (fullName === userDetails?.name &&
                email === userDetails?.email &&
                phone === (userDetails?.phoneNumber || ""))
            }
          >
            {updating ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
