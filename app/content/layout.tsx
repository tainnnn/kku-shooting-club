import Navbar from '@/components/Navbar'

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex bg-white">
        {children}
      </main>
    </div>
  )
}
