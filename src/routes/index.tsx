import { createFileRoute, Link } from '@tanstack/react-router'
import { getPosts } from '@/lib/post.api'
import { Clock, User } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const Route = createFileRoute('/')({
  loader: async () => {
    const posts = await getPosts({ data: { status: 'PUBLISHED' } })
    return { posts }
  },
  staleTime: 0,
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

function estimateReadingTime(content: string): number {
  const chars = content.replace(/\s/g, '').length
  return Math.max(1, Math.ceil(chars / 300))
}

// Gradient placeholders for posts without cover images
const placeholderGradients = [
  'from-primary/15 via-accent/10 to-secondary/15',
  'from-secondary/15 via-primary/10 to-accent/15',
  'from-accent/15 via-secondary/10 to-primary/15',
  'from-primary/20 to-accent/20',
  'from-secondary/20 to-primary/20',
]

function Index() {
  const { posts } = Route.useLoaderData()

  const heroPost = posts.find((p) => p.coverImage)
  const otherPosts = posts.filter((p) => p.id !== heroPost?.id)

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12 min-h-[calc(100vh-140px)]">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-6 text-lg">还没有文章</p>
            <Link
              to="/editor"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-85 transition-opacity text-sm"
            >
              写第一篇文章
            </Link>
          </div>
        ) : (
          <>
            {/* Hero — 第一篇有封面的文章 */}
            {heroPost && (
              <section className="mb-16">
                <Link
                  to="/posts/$slug"
                  params={{ slug: heroPost.slug }}
                  className="group relative h-[520px] w-full rounded-2xl overflow-hidden block"
                >
                  <img
                    src={heroPost.coverImage!}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    alt={heroPost.title}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    {heroPost.category && (
                      <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4 tracking-wide uppercase">
                        {heroPost.category.name}
                      </span>
                    )}
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight max-w-3xl">
                      {heroPost.title}
                    </h2>
                    {heroPost.summary && (
                      <p className="text-white/70 text-sm md:text-base mb-5 max-w-2xl line-clamp-2 leading-relaxed hidden sm:block">
                        {heroPost.summary}
                      </p>
                    )}
                    <div className="flex items-center text-white/60 text-sm gap-4">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {heroPost.author?.name || '匿名'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(heroPost.createdAt.toString())}
                      </span>
                      <span className="text-white/40">
                        约 {estimateReadingTime(heroPost.content)} 分钟阅读
                      </span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* 文章列表 */}
            {otherPosts.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-foreground mb-8 flex items-center gap-3 uppercase tracking-widest">
                  <span className="h-px flex-1 bg-border" />
                  最新文章
                  <span className="h-px flex-1 bg-border" />
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {otherPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      to="/posts/$slug"
                      params={{ slug: post.slug }}
                      className="group flex flex-col"
                    >
                      {/* Cover image or gradient placeholder */}
                      <div className="aspect-[16/10] rounded-xl overflow-hidden mb-5 shrink-0">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500"
                            alt={post.title}
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-gradient-to-br ${placeholderGradients[index % placeholderGradients.length]} flex items-center justify-center`}
                          >
                            <span className="text-3xl font-black text-foreground/10 select-none">
                              MP
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 gap-2">
                        {post.category && (
                          <span className="text-accent text-xs font-bold uppercase tracking-widest">
                            {post.category.name}
                          </span>
                        )}
                        <h3 className="text-lg font-bold leading-snug group-hover:text-accent transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.summary && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1">
                            {post.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 mt-auto">
                          <span>{formatDate(post.createdAt.toString())}</span>
                          <span className="text-border">·</span>
                          <span>{post.author?.name || '匿名'}</span>
                          <span className="text-border">·</span>
                          <span>{estimateReadingTime(post.content)} 分钟</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 当没有 Hero 但有文章时，第一篇也进了列表 — 单独处理无封面的 heroPost */}
            {!heroPost && posts.length > 0 && otherPosts.length === 0 && (
              <section>
                <h2 className="text-sm font-bold text-foreground mb-8 flex items-center gap-3 uppercase tracking-widest">
                  <span className="h-px flex-1 bg-border" />
                  最新文章
                  <span className="h-px flex-1 bg-border" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {posts.map((post, index) => (
                    <Link
                      key={post.id}
                      to="/posts/$slug"
                      params={{ slug: post.slug }}
                      className="group flex flex-col"
                    >
                      <div className="aspect-[16/10] rounded-xl overflow-hidden mb-5 shrink-0">
                        <div
                          className={`w-full h-full bg-gradient-to-br ${placeholderGradients[index % placeholderGradients.length]} flex items-center justify-center`}
                        >
                          <span className="text-3xl font-black text-foreground/10 select-none">MP</span>
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 gap-2">
                        {post.category && (
                          <span className="text-accent text-xs font-bold uppercase tracking-widest">
                            {post.category.name}
                          </span>
                        )}
                        <h3 className="text-lg font-bold leading-snug group-hover:text-accent transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.summary && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1">
                            {post.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 mt-auto">
                          <span>{formatDate(post.createdAt.toString())}</span>
                          <span className="text-border">·</span>
                          <span>{post.author?.name || '匿名'}</span>
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

      <Footer />
    </div>
  )
}
