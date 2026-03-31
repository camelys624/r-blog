import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { getPostBySlug } from '@/lib/post.api'
import { MarkdownPreview } from '@/components/markdown-preview'
import { ArrowLeft, Clock, Share2, User } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? (scrollTop / total) * 100 : 0
      if (barRef.current) barRef.current.style.width = `${pct}%`
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 h-[3px] bg-primary z-[100]"
      style={{ width: '0%' }}
    />
  )
}

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    const post = await getPostBySlug({ data: params.slug })
    return { post }
  },
  component: PostDetail,
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function estimateReadingTime(content: string): number {
  const chars = content.replace(/\s/g, '').length
  return Math.max(1, Math.ceil(chars / 300))
}

function PostDetail() {
  const { post } = Route.useLoaderData()

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const readingTime = estimateReadingTime(post.content)

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ReadingProgressBar />

      <Header />

      {/* Article content */}
      <article className="max-w-6xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-10 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          返回列表
        </Link>

        {/* Article header */}
        <header className="mb-10">
          {post.category && (
            <div className="text-accent font-bold mb-3 uppercase tracking-widest text-xs">
              {post.category.name}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-8">
            {post.title}
          </h1>

          {/* Author / meta bar */}
          <div className="flex items-center justify-between border-y border-border py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-base font-semibold overflow-hidden shrink-0">
                {post.author?.image ? (
                  <img
                    src={post.author.image}
                    alt={post.author.name || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">
                  {post.author?.name || '匿名'}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(post.createdAt.toString())}
                  </span>
                  <span>约 {readingTime} 分钟阅读</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="p-2 border border-border rounded-full hover:bg-muted hover:border-accent transition-colors"
              aria-label="分享文章"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Cover image — inside the container, below the meta bar */}
        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-10 aspect-[21/9]">
            <img
              src={post.coverImage}
              className="w-full h-full object-cover"
              alt={post.title}
            />
          </div>
        )}

        {/* Summary / pull quote */}
        {post.summary && (
          <blockquote className="mb-10 text-lg font-medium text-foreground/80 leading-relaxed italic border-l-[3px] border-accent pl-5">
            {post.summary}
          </blockquote>
        )}

        {/* Article body */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MarkdownPreview content={post.content} />
        </div>
      </article>

      <Footer />
    </div>
  )
}
