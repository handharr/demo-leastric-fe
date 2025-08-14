export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <span className="items-center justify-center text-2xl font-bold text-gray-800">
        Dashboard
      </span>
      {children}
    </div>
  );
}
