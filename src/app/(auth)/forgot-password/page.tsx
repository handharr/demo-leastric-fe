import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-leastric-primary rounded-sm flex items-center justify-center">
          <span className="text-white font-bold text-sm">⚡</span>
        </div>
        <span className="text-xl font-bold text-gray-900">LEASTRIC</span>
      </div>

      {/* Back Button */}
      <Link
        href="/login"
        className="inline-flex items-center text-gray-600 hover:text-gray-800"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Link>

      {/* Reset Password Content */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            To reset your password, please reach out to our administrator for
            assistance.
          </p>
        </div>

        <button className="w-full bg-leastric-primary text-white py-3 px-4 rounded-md font-medium hover:bg-leastric-secondary transition duration-200 focus:outline-none focus:ring-2 focus:ring-leastric-primary focus:ring-offset-2">
          Contact Our Administrator
        </button>
      </div>
    </div>
  );
}
