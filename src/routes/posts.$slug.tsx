import { createFileRoute, Link } from '@tanstack/react-router'
import { getPostBySlug } from '@/lib/post.api'
import { MarkdownPreview } from '@/components/markdown-preview'
import { ArrowLeft, Clock, Share2 } from 'lucide-react'
import { Header } from '@/components/header'

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

function PostDetail() {
  const { post } = Route.useLoaderData()

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12 min-h-[calc(100vh-140px)]">
        {/* 返回按钮 */}
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-accent mb-10 transition group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition" />
          返回列表
        </Link>

        {/* 文章头部 */}
        <header className="mb-12">
          {post.category && (
            <div className="text-accent font-bold mb-4 uppercase tracking-widest text-sm">
              {post.category.name}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight mb-8">
            {post.title}
          </h1>

          {/* 作者信息栏 */}
          <div className="flex items-center justify-between border-y border-border py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium overflow-hidden">
                {post.author?.image ? (
                  <img src={post.author.image} alt={post.author.name || ''} className="w-full h-full object-cover" />
                ) : (
                  (post.author?.name || '匿名').charAt(0)
                )}
              </div>
              <div>
                <div className="font-bold text-foreground">{post.author?.name || '匿名'}</div>
                <div className="text-sm text-muted-foreground flex items-center space-x-2">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {formatDate(post.createdAt.toString())}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="p-2 border border-border rounded-full hover:bg-muted transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 封面图片 */}
        {post.coverImage && (
          <img
            src={post.coverImage}
            className="w-full rounded-3xl mb-12 h-[500px] object-cover"
            alt={post.title}
          />
        )}

        {/* 摘要引用 */}
        {post.summary && (
          <p className="mb-10 text-xl font-medium text-foreground leading-relaxed italic border-l-4 border-accent pl-6">
            " {post.summary} "
          </p>
        )}

        {/* 正文内容 */}
        <div className="prose prose-lg max-w-none">
          <MarkdownPreview content={post.content} />
        </div>
      </article>

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
