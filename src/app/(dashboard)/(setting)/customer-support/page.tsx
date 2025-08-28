import Image from "next/image";

export default function CustomerSupportPage() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-8">
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
              src="/support-illustration.png"
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
        <button className="flex items-center gap-2 border border-[#D1D5DB] rounded-lg px-5 py-3 font-medium text-gray-800 hover:bg-gray-50 transition">
          <span className="text-lg">📞</span>
          Call Leastric Support
        </button>
        <button className="flex items-center gap-2 border border-[#D1D5DB] rounded-lg px-5 py-3 font-medium text-gray-800 hover:bg-gray-50 transition">
          <span className="text-lg">💬</span>
          Chat with WhatsApp
        </button>
        <button className="flex items-center gap-2 border border-[#D1D5DB] rounded-lg px-5 py-3 font-medium text-gray-800 hover:bg-gray-50 transition">
          <span className="text-lg">✉️</span>
          Send an Email
        </button>
      </div>

      {/* Policies */}
      <div>
        <div className="font-semibold text-gray-700 mb-3">Policies</div>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 border border-[#D1D5DB] rounded-lg px-5 py-3 font-medium text-gray-800 hover:bg-gray-50 transition">
            <span className="text-lg">❓</span>
            FAQ
          </button>
          <button className="flex items-center gap-2 border border-[#D1D5DB] rounded-lg px-5 py-3 font-medium text-gray-800 hover:bg-gray-50 transition">
            <span className="text-lg">📄</span>
            Terms &amp; Conditions
          </button>
          <button className="flex items-center gap-2 border border-[#D1D5DB] rounded-lg px-5 py-3 font-medium text-gray-800 hover:bg-gray-50 transition">
            <span className="text-lg">🔒</span>
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}
