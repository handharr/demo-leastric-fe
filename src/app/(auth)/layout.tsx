export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        {children}
      </div>
      {/* Right Side - Illustration (same as before) */}
      <div className="flex-1 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative overflow-hidden">
        {/* Your existing illustration code */}
      </div>
    </div>
  );
}
