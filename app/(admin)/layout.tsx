import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              My Blog
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/notes/new"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                New Note
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            View Site
          </Link>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  )
}
