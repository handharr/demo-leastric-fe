import Image from "next/image";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Right Side - Illustration (shown first on mobile, second on desktop) */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden order-1 lg:order-2 min-h-[40vh] lg:min-h-screen">
        {/* Background Image */}
        <Image
          src="/resources/images/auth/auth-illustration.jpg"
          alt="Authentication illustration"
          fill
          className="object-cover object-left"
          priority
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: `linear-gradient(0deg, rgba(51, 51, 51, 0.4), rgba(51, 51, 51, 0.4)), linear-gradient(0deg, rgba(23, 54, 29, 0.3), rgba(23, 54, 29, 0.3))`,
          }}
        />

        {/* Content on top of overlay (if needed) */}
        <div className="relative z-20">
          {/* Add any content that should appear over the image */}
        </div>
      </div>

      {/* Left Side - Login Form (shown second on mobile, first on desktop) */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12 order-2 lg:order-1">
        {children}
      </div>
    </div>
  );
}
