import Image from "next/image";

type SupportButtonProps = {
  icon?: string; // path to icon image
  emoji?: string; // for emoji icon
  alt?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export function SupportButton({
  icon,
  emoji,
  alt,
  children,
  onClick,
  className = "",
}: SupportButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 cursor-pointer border border-[#D1D5DB] rounded-lg font-medium text-typography-headline hover:bg-gray-50 transition ${className}`}
      onClick={onClick}
    >
      {icon && (
        <Image
          src={icon}
          alt={alt || ""}
          width={20}
          height={20}
          className="w-[20px] h-[20px]"
        />
      )}
      {emoji && <span className="text-lg">{emoji}</span>}
      {children}
    </button>
  );
}

export default function CustomerSupportPage() {
  return (
    <div className="bg-white gap-[16px]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Customer Support
      </h2>

      {/* Help Banner */}
      <div className="flex items-center justify-between bg-[#FFF7E0] rounded-xl px-6 py-5 mb-6">
        <div>
          <div className="font-semibold text-lg text-gray-800 mb-1">
            Need Help?
          </div>
          <div className="text-gray-700">
            We&apos;re always ready to help you at{" "}
            <span className="font-bold">08:00 - 22:00</span> WIB
          </div>
        </div>
        {/* Illustration */}
        <div>
          <span className="inline-block">
            <Image
              src="/resources/images/illustration/help-center-2.png"
              alt="Support"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </span>
        </div>
      </div>

      {/* Support Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <SupportButton
          icon="/resources/icons/communication/telephone.svg"
          alt="Call"
          className="px-[16px] py-[10px]"
        >
          Call Leastric Support
        </SupportButton>
        <SupportButton
          icon="/resources/icons/general/whatsapp.svg"
          alt="Chat"
          className="px-[16px] py-[10px]"
        >
          Chat with WhatsApp
        </SupportButton>
        <SupportButton
          icon="/resources/icons/communication/email.svg"
          alt="Email"
          className="px-[16px] py-[10px]"
        >
          Send an Email
        </SupportButton>
      </div>

      {/* Policies */}
      <div>
        <div className="font-semibold text-gray-700 mb-3">Policies</div>
        <div className="flex flex-wrap gap-4">
          <SupportButton
            icon="/resources/icons/menu/question-circle.svg"
            alt="FAQ"
            className="px-5 py-3"
          >
            FAQ
          </SupportButton>
          <SupportButton
            icon="/resources/icons/document/list-2.svg"
            className="px-5 py-3"
          >
            Terms &amp; Conditions
          </SupportButton>
          <SupportButton
            icon="/resources/icons/security/shield-info.svg"
            alt="Terms"
            className="px-5 py-3"
          >
            Privacy Policy
          </SupportButton>
        </div>
      </div>
    </div>
  );
}
