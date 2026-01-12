import Navbar from '@/app/admin/component/Navbar-admin'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
      <Navbar />
      {children}
    </div>
  )
}
