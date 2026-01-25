import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getPosts, deletePost, updatePostStatus } from '@/lib/post.api'
import { getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin')({
  loader: async () => {
    const posts = await getPosts({ data: { status: 'ALL' } })
    return { posts }
  },
  // 每次访问都重新加载数据
  staleTime: 0,
  component: AdminPage,
})

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return undefined
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AdminPage() {
  const navigate = useNavigate()
  const { posts: initialPosts } = Route.useLoaderData()
  const [posts, setPosts] = useState(initialPosts)
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const sessionToken = getCookie('session_token')
    if (!sessionToken) {
      setAuthStatus('unauthorized')
      return
    }

    getCurrentUser({ data: { sessionToken } })
      .then((user) => {
        if (user?.role === 'ADMIN') {
          setAuthStatus('authorized')
        } else {
          setAuthStatus('unauthorized')
        }
      })
      .catch(() => {
        setAuthStatus('unauthorized')
      })
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除文章「${title}」吗？此操作不可撤销。`)) {
      return
    }

    setDeletingId(id)
    try {
      await deletePost({ data: { id } })
      setPosts(posts.filter((p) => p.id !== id))
      toast.success('文章已删除')
    } catch (error) {
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    setTogglingId(id)
    try {
      const updatedPost = await updatePostStatus({
        data: { id, status: newStatus },
      })
      setPosts(posts.map((p) => (p.id === id ? updatedPost : p)))
      toast.success(newStatus === 'PUBLISHED' ? '文章已发布' : '文章已设为草稿')
    } catch (error) {
      toast.error('更新失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setTogglingId(null)
    }
  }

  // 加载中
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  // 未授权
  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">无权访问</h1>
            <p className="text-muted-foreground mb-6">
              只有管理员才能访问此页面。
            </p>
            <Button onClick={() => navigate({ to: '/' })}>返回首页</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">文章管理</h1>
            <p className="text-muted-foreground mt-1">
              共 {posts.length} 篇文章
            </p>
          </div>
          <Link
            to="/editor"
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            写文章
          </Link>
        </div>

        {/* 文章列表 */}
        {posts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground mb-4">还没有文章</p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              写第一篇文章
            </Link>
          </div>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    标题
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                    分类
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    创建时间
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">
                    状态
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover hidden sm:block"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-xs">
                            {post.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {post.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {post.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.createdAt.toString())}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {post.status === 'PUBLISHED' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* 查看 */}
                        <Link
                          to="/posts/$slug"
                          params={{ slug: post.slug }}
                          className="p-2 text-muted-foreground hover:text-foreground transition"
                          title="查看文章"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* 切换状态 */}
                        <button
                          onClick={() => handleToggleStatus(post.id, post.status)}
                          disabled={togglingId === post.id}
                          className="p-2 text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                          title={post.status === 'PUBLISHED' ? '设为草稿' : '发布'}
                        >
                          {togglingId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : post.status === 'PUBLISHED' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        {/* 删除 */}
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deletingId === post.id}
                          className="p-2 text-muted-foreground hover:text-red-500 transition disabled:opacity-50"
                          title="删除"
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
