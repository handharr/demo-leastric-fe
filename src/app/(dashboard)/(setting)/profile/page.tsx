"use client";

import { useEffect, useState } from "react";
import { useGetUserDetails } from "@/shared/presentation/hooks/use-get-user-details";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("Jono Sujono Mangunkusom");
  const [email, setEmail] = useState("Jonosujono@gmail.com");
  const [phone, setPhone] = useState("");
  const { userDetails, loading, error } = useGetUserDetails();

  useEffect(() => {
    if (userDetails) {
      setFullName(userDetails.name);
      setEmail(userDetails.email);
      setPhone(userDetails.phoneNumber);
    }
  }, [userDetails]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col w-full gap-[16px]">
      <h2 className="text-xl font-semibold">Profile</h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-[16px]"
        onSubmit={(e) => {
          e.preventDefault();
          // handle save
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
        <div>
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
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary border-brand-primary"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-brand-primary text-white px-8 py-2 rounded-md font-medium hover:bg-brand-primary transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
