import Navbar from '@/app/admin/component/Navbar-admin'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* sidebar / navbar */}
      <Navbar />

      {/* main content */}
      <main className="flex-1 flex bg-white pb-6">
          <div className="mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
