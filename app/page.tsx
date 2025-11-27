import Link from 'next/link'

export default function HomePage() {
  const notes: never[] = [] // TODO: 连接数据库后从 prisma 获取

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            My Blog
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/notes"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Notes
            </Link>
            <Link
              href="/notes/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Write
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A place for thoughts, ideas, and notes.
          </p>
        </div>
      </section>

      {/* Recent Notes */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Recent Notes</h2>

        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">No published notes yet.</p>
            <Link
              href="/notes/new"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Create your first note
            </Link>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-gray-500">
          Built with Next.js
        </div>
      </footer>
    </div>
  )
}
