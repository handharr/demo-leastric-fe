export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Right Side - Illustration (shown first on mobile, second on desktop) */}
      <div className="flex-1 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative overflow-hidden order-1 lg:order-2 min-h-[40vh] lg:min-h-screen">
        {/* Illustration Content */}
        <span className="items-center justify-center text-2xl font-bold text-gray-800">
          Should be an illustration here
        </span>
      </div>

      {/* Left Side - Login Form (shown second on mobile, first on desktop) */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12 order-2 lg:order-1">
        {children}
      </div>
    </div>
  );
}
