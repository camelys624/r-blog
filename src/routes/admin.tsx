import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getPosts, deletePost, updatePostStatus } from '@/lib/post.api'
import { createApiKey, getApiKeys, deleteApiKey } from '@/lib/api-key'
import { getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Plus,
  Key,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin')({
  loader: async () => {
    const posts = await getPosts({ data: { status: 'ALL' } })
    return { posts }
  },
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

type ApiKeyItem = {
  id: string
  name: string
  key: string
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

function AdminPage() {
  const navigate = useNavigate()
  const { posts: initialPosts } = Route.useLoaderData()
  const [posts, setPosts] = useState(initialPosts)
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // API Key 相关状态
  const [activeTab, setActiveTab] = useState<'posts' | 'apikeys'>('posts')
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null)

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

  // 加载 API Keys
  const loadApiKeys = async () => {
    const sessionToken = getCookie('session_token')
    if (!sessionToken) return

    setLoadingKeys(true)
    try {
      const keys = await getApiKeys({ data: { sessionToken } })
      setApiKeys(keys)
    } catch (error) {
      toast.error('加载 API Key 失败')
    } finally {
      setLoadingKeys(false)
    }
  }

  useEffect(() => {
    if (authStatus === 'authorized' && activeTab === 'apikeys') {
      loadApiKeys()
    }
  }, [authStatus, activeTab])

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

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('请输入 API Key 名称')
      return
    }

    const sessionToken = getCookie('session_token')
    if (!sessionToken) return

    setCreatingKey(true)
    try {
      const result = await createApiKey({
        data: { sessionToken, name: newKeyName.trim() },
      })
      setNewlyCreatedKey(result.key)
      setNewKeyName('')
      loadApiKeys()
      toast.success('API Key 创建成功')
    } catch (error) {
      toast.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setCreatingKey(false)
    }
  }

  const handleCopyKey = async () => {
    if (newlyCreatedKey) {
      await navigator.clipboard.writeText(newlyCreatedKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
      toast.success('已复制到剪贴板')
    }
  }

  const handleDeleteApiKey = async (id: string, name: string) => {
    if (!confirm(`确定要删除 API Key「${name}」吗？此操作不可撤销。`)) {
      return
    }

    const sessionToken = getCookie('session_token')
    if (!sessionToken) return

    setDeletingKeyId(id)
    try {
      await deleteApiKey({ data: { sessionToken, id } })
      setApiKeys(apiKeys.filter((k) => k.id !== id))
      toast.success('API Key 已删除')
    } catch (error) {
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setDeletingKeyId(null)
    }
  }

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

  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">无权访问</h1>
            <p className="text-muted-foreground mb-6">只有管理员才能访问此页面。</p>
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
        {/* Tab 切换 */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-1 text-sm font-medium transition border-b-2 ${
              activeTab === 'posts'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            文章管理
          </button>
          <button
            onClick={() => setActiveTab('apikeys')}
            className={`pb-3 px-1 text-sm font-medium transition border-b-2 ${
              activeTab === 'apikeys'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            API Key
          </button>
        </div>

        {/* 文章管理 */}
        {activeTab === 'posts' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">文章管理</h1>
                <p className="text-muted-foreground mt-1">共 {posts.length} 篇文章</p>
              </div>
              <Link
                to="/editor"
                className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition"
              >
                <Plus className="w-4 h-4" />
                写文章
              </Link>
            </div>

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
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">标题</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden md:table-cell">分类</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">创建时间</th>
                      <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">状态</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-muted/30 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.coverImage && (
                              <img src={post.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover hidden sm:block" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate max-w-xs">{post.title}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">{post.summary}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{post.category?.name || '-'}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">{formatDate(post.createdAt.toString())}</span>
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
                            <Link
                              to="/posts/$slug"
                              params={{ slug: post.slug }}
                              className="p-2 text-muted-foreground hover:text-foreground transition"
                              title="查看文章"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
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
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              disabled={deletingId === post.id}
                              className="p-2 text-muted-foreground hover:text-red-500 transition disabled:opacity-50"
                              title="删除"
                            >
                              {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* API Key 管理 */}
        {activeTab === 'apikeys' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">API Key 管理</h1>
              <p className="text-muted-foreground mt-1">创建和管理用于 API 调用的密钥</p>
            </div>

            {/* 创建新 Key */}
            <div className="border border-border rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                创建新的 API Key
              </h2>

              {newlyCreatedKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                      API Key 创建成功！请立即复制保存，此密钥只显示一次。
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-3 bg-white dark:bg-black rounded-lg text-sm font-mono break-all">
                        {newlyCreatedKey}
                      </code>
                      <Button onClick={handleCopyKey} variant="outline" size="sm">
                        {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={() => setNewlyCreatedKey(null)} variant="outline">
                    完成
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    placeholder="输入 API Key 名称（如：博客发布脚本）"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleCreateApiKey} disabled={creatingKey}>
                    {creatingKey ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    创建
                  </Button>
                </div>
              )}
            </div>

            {/* Key 列表 */}
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4">
                <h3 className="text-sm font-medium text-muted-foreground">已创建的 API Key</h3>
              </div>

              {loadingKeys ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">还没有创建 API Key</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">名称</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Key</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">创建时间</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">最后使用</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id} className="hover:bg-muted/30 transition">
                        <td className="px-6 py-4">
                          <span className="font-medium text-foreground">{apiKey.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm text-muted-foreground font-mono">{apiKey.key}</code>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{formatDate(apiKey.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : '从未使用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteApiKey(apiKey.id, apiKey.name)}
                            disabled={deletingKeyId === apiKey.id}
                            className="p-2 text-muted-foreground hover:text-red-500 transition disabled:opacity-50"
                            title="删除"
                          >
                            {deletingKeyId === apiKey.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 使用说明 */}
            <div className="mt-6 p-6 bg-muted/30 rounded-2xl">
              <h3 className="font-semibold text-foreground mb-3">使用说明</h3>
              <p className="text-sm text-muted-foreground mb-4">通过 API Key 调用接口创建文章：</p>
              <pre className="p-4 bg-background rounded-xl text-sm overflow-x-auto">
                <code>{`curl -X POST https://your-domain.com/api/posts \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {
      "apiKey": "sk_xxxxxxxxxxxx",
      "content": "# 文章标题\\n\\n正文内容...",
      "status": "DRAFT"
    }
  }'`}</code>
              </pre>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
