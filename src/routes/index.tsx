import { createFileRoute, Link } from '@tanstack/react-router'
import { getPosts } from '@/lib/post.api'
import { Clock, User, Search } from 'lucide-react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const posts = await getPosts()
    return { posts }
  },
  component: Index,
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function Index() {
  const { posts } = Route.useLoaderData()

  // 取第一篇有封面的文章作为 Hero
  const heroPost = posts.find((p) => p.coverImage)
  // 其余文章
  const otherPosts = posts.filter((p) => p.id !== heroPost?.id)

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Header - 毛玻璃效果 */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter">
            MIND<span className="text-accent">POST</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-10 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-accent transition">
              首页
            </Link>
            <a href="#" className="hover:text-accent transition">
              分类
            </a>
            <a href="#" className="hover:text-accent transition">
              关于
            </a>
          </nav>

          <div className="flex items-center space-x-6">
            <button className="p-2 text-muted-foreground hover:text-accent transition">
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/editor"
              className="hidden md:block px-5 py-2.5 bg-foreground text-background text-sm rounded-full font-medium hover:opacity-90 transition"
            >
              写文章
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 min-h-[calc(100vh-140px)]">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">还没有文章</p>
            <Link
              to="/editor"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition"
            >
              写第一篇文章
            </Link>
          </div>
        ) : (
          <>
            {/* Hero Section - 第一篇有封面的文章 */}
            {heroPost && (
              <section className="mb-16">
                <Link
                  to="/posts/$slug"
                  params={{ slug: heroPost.slug }}
                  className="group relative h-[500px] w-full rounded-3xl overflow-hidden block"
                >
                  <img
                    src={heroPost.coverImage!}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    alt={heroPost.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                    {heroPost.category && (
                      <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4">
                        {heroPost.category.name}
                      </span>
                    )}
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-3xl">
                      {heroPost.title}
                    </h2>
                    <div className="flex items-center text-gray-300 text-sm space-x-4">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-2" /> {heroPost.authorName}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />{' '}
                        {formatDate(heroPost.createdAt.toString())}
                      </span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* 文章列表 */}
            {otherPosts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-8 flex items-center">
                  最新文章
                  <span className="ml-3 h-0.5 flex-1 bg-border" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {otherPosts.map((post) => (
                    <Link
                      key={post.id}
                      to="/posts/$slug"
                      params={{ slug: post.slug }}
                      className="group"
                    >
                      {post.coverImage && (
                        <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6">
                          <img
                            src={post.coverImage}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            alt={post.title}
                          />
                        </div>
                      )}
                      <div className="space-y-3">
                        {post.category && (
                          <div className="text-accent text-xs font-bold uppercase tracking-widest">
                            {post.category.name}
                          </div>
                        )}
                        <h3 className="text-2xl font-bold group-hover:text-accent transition">
                          {post.title}
                        </h3>
                        {post.summary && (
                          <p className="text-muted-foreground leading-relaxed line-clamp-2">
                            {post.summary}
                          </p>
                        )}
                        <div className="flex items-center pt-2 text-sm text-muted-foreground">
                          <span>{formatDate(post.createdAt.toString())}</span>
                          <span className="mx-2">·</span>
                          <span>{post.authorName}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 MindPost. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
