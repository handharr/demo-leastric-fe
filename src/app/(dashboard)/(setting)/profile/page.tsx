"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("Jono Sujono Mangunkusom");
  const [email, setEmail] = useState("Jonosujono@gmail.com");
  const [phone, setPhone] = useState("");

  return (
    <div className="flex flex-col w-full ">
      <h2 className="text-xl font-semibold mb-6">Profile</h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          // handle save
        }}
      >
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-700 border-green-700"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            type="text"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-700"
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
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-700"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-green-800 text-white px-8 py-2 rounded-md font-medium hover:bg-green-900 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
