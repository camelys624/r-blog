import { Link } from '@tanstack/react-router'

interface PostCardProps {
  post: {
    id: string
    title: string
    slug: string
    summary?: string | null
    content: string
    coverImage?: string | null
    authorName: string
    createdAt: string
    category?: {
      name: string
    }
  }
  variant?: 'default' | 'featured'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getExcerpt(content: string, maxLength = 120): string {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  if (plainText.length <= maxLength) return plainText
  return plainText.slice(0, maxLength) + '...'
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const excerpt = post.summary || getExcerpt(post.content)

  if (variant === 'featured' && post.coverImage) {
    return (
      <Link
        to="/posts/$slug"
        params={{ slug: post.slug }}
        className="group block"
      >
        <article className="bg-card rounded-md overflow-hidden border border-border hover:shadow-lg transition-shadow">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 space-y-3">
            <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {excerpt}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-accent font-medium">By {post.authorName}</span>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link
      to="/posts/$slug"
      params={{ slug: post.slug }}
      className="group block"
    >
      <article className="space-y-3">
        <h2 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {excerpt}
        </p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {post.authorName.charAt(0)}
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">{post.authorName}</p>
            <p className="text-muted-foreground">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </article>
    </Link>
  )
}
