"use client";

import { useEffect, useState } from "react";
import { useGetUserDetails } from "@/shared/presentation/hooks/use-get-user-details";
import { useUpdateUserDetails } from "@/shared/presentation/hooks/use-update-user-details";
import LoadingSpinner from "@/shared/presentation/components/loading/loading-spinner";
import ProfileFormTile from "@/shared/presentation/components/form-tile/profile-form-tile";
import {
  usePopup,
  PopupType,
} from "@/shared/presentation/hooks/top-popup-context";
import PrimaryContainer from "@/shared/presentation/components/container/primary-container";

export default function ProfilePage() {
  const { showPopup } = usePopup();
  const {
    userDetails,
    loading,
    error,
    fetchUserDetails,
    reset: resetUserDetails,
  } = useGetUserDetails();
  const {
    updateUserDetails,
    loading: updating,
    error: updateError,
    success,
    resetState,
  } = useUpdateUserDetails();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (userDetails) {
      setFullName(userDetails.name || "");
      setEmail(userDetails.email || "");
      setPhone(userDetails.phoneNumber || "");
    }
  }, [userDetails]);

  useEffect(() => {
    if (success) {
      // Handle success case
      fetchUserDetails();
      resetState();
    }

    if (updateError) {
      showPopup(updateError.message, PopupType.ERROR);
      resetState();
    }

    if (error) {
      showPopup(error.message, PopupType.ERROR);
      resetUserDetails();
    }
  }, [
    success,
    fetchUserDetails,
    resetState,
    updateError,
    showPopup,
    error,
    resetUserDetails,
  ]);

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
    <PrimaryContainer>
      <form
        className="flex flex-col gap-[24px] w-full"
        onSubmit={(e) => {
          e.preventDefault();
          updateUserDetails({
            email,
            fullName: fullName,
            phoneNumber: phone.length > 0 ? phone : undefined,
          });
        }}
      >
        <ProfileFormTile
          title="Profile"
          userDetails={userDetails || undefined}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="cursor-pointer bg-brand-primary text-white px-8 py-2 rounded-md font-medium hover:bg-brand-primary transition disabled:bg-cta-disabled disabled:text-typography-disabled"
            disabled={
              updating ||
              (fullName === userDetails?.name &&
                email === userDetails?.email &&
                phone === (userDetails?.phoneNumber || ""))
            }
          >
            {updating ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </form>
    </PrimaryContainer>
  );
}
