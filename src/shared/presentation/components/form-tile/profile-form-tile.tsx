import { UserModel } from "@/shared/domain/entities/user-model";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";

interface ProfileFormTileProps {
  title?: string;
  userDetails?: UserModel;
  fullName?: string;
  setFullName?: (name: string) => void;
  email?: string;
  setEmail?: (email: string) => void;
  phone?: string;
  setPhone?: (phone: string) => void;
}

export default function ProfileFormTile({
  title,
  userDetails,
  fullName = optionalValue(userDetails?.name).orEmpty(),
  setFullName,
  email = optionalValue(userDetails?.email).orEmpty(),
  setEmail,
  phone = optionalValue(userDetails?.phoneNumber).orEmpty(),
  setPhone,
}: ProfileFormTileProps) {
  return (
    <div className="flex flex-col w-full gap-[16px]">
      <h2 className="text-xl font-semibold">
        {optionalValue(title).orDefault("Profile")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Full Name <span className="text-typography-negative">*</span>
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary border-form-border"
            value={fullName}
            onChange={(e) => setFullName?.(e.target.value)}
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
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary border-form-border"
            value={email}
            onChange={(e) => setEmail?.(e.target.value)}
            required
            type="email"
            placeholder="Enter your email"
          />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary border-form-border"
            value={phone}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, "");
              setPhone?.(onlyNums);
            }}
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>
      </div>
    </div>
  );
}
