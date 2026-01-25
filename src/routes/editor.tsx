import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { KeyboardEvent, UIEvent, ClipboardEvent, DragEvent } from 'react'
import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MarkdownPreview } from '@/components/markdown-preview'
import { createPost } from '@/lib/post.api'
import { uploadImageToHost } from '@/lib/upload.api'
import { getCurrentUser } from '@/lib/auth'
import { Loader2, ShieldAlert } from 'lucide-react'

export const Route = createFileRoute('/editor')({
  component: Editor,
})

// 从 Markdown 内容中提取标题（第一个 H1）
function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

function Editor() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // 权限检查状态
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    // 从 cookie 读取 session token
    const getCookie = (name: string): string | undefined => {
      if (typeof document === 'undefined') return undefined
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return undefined
    }

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

  // 滚动同步相关的 refs
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null)

  // 从内容中提取标题
  const extractedTitle = useMemo(() => extractTitle(content), [content])

  // 将 File 转换为 base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // 移除 data:image/xxx;base64, 前缀
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 在光标位置插入文本
  const insertTextAtCursor = (text: string) => {
    const textarea = editorRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)
    setContent(newContent)

    // 设置光标位置到插入文本之后
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length
      textarea.focus()
    })
  }

  // 上传图片并插入 Markdown 语法
  const uploadAndInsertImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('只支持上传图片文件')
      return
    }

    // 检查文件大小（imgbb 限制 32MB）
    if (file.size > 32 * 1024 * 1024) {
      toast.error('图片大小不能超过 32MB')
      return
    }

    setIsUploading(true)
    const loadingToast = toast.loading('正在上传图片...')

    try {
      const base64 = await fileToBase64(file)
      const result = await uploadImageToHost({
        data: {
          imageBase64: base64,
          name: file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
        },
      })

      // 插入 Markdown 图片语法
      const imageName = file.name.replace(/\.[^/.]+$/, '') || 'image'
      insertTextAtCursor(`![${imageName}](${result.url})\n`)

      toast.dismiss(loadingToast)
      toast.success('图片上传成功')
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(error instanceof Error ? error.message : '图片上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  // 处理粘贴事件
  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          await uploadAndInsertImage(file)
        }
        break
      }
    }
  }

  // 处理拖拽悬停
  const handleDragOver = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // 处理拖放
  const handleDrop = async (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return

    // 上传所有图片文件
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        await uploadAndInsertImage(file)
      }
    }
  }

  // 同步滚动处理
  const handleEditorScroll = useCallback((e: UIEvent<HTMLTextAreaElement>) => {
    if (isScrollingRef.current === 'preview') return
    isScrollingRef.current = 'editor'

    const editor = e.currentTarget
    const preview = previewRef.current
    if (!preview) return

    // 计算滚动百分比
    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
    // 应用到预览区
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)

    // 重置滚动源标记
    requestAnimationFrame(() => {
      isScrollingRef.current = null
    })
  }, [])

  const handlePreviewScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (isScrollingRef.current === 'editor') return
    isScrollingRef.current = 'preview'

    const preview = e.currentTarget
    const editor = editorRef.current
    if (!editor) return

    // 计算滚动百分比
    const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)
    // 应用到编辑区
    editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight)

    // 重置滚动源标记
    requestAnimationFrame(() => {
      isScrollingRef.current = null
    })
  }, [])

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('请输入文章内容')
      return
    }
    if (!extractedTitle) {
      toast.error('请在文章开头添加标题（使用 # 标题）')
      return
    }

    setIsSaving(true)
    try {
      await createPost({
        data: {
          content: content.trim(),
          coverImage: coverImage.trim() || undefined,
          status: 'DRAFT',
        },
      })
      toast.success('文章保存成功！')
      setContent('')
      setCoverImage('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate({ to: '/' })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      const newContent = content.substring(0, start) + '  ' + content.substring(end)
      setContent(newContent)

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }

  // 加载中状态
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">验证权限中...</p>
        </div>
      </div>
    )
  }

  // 未授权状态
  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">无权访问</h1>
          <p className="text-muted-foreground mb-6">
            只有管理员才能编辑文章。请先登录管理员账号。
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-4 px-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">编辑文章</h1>
            {extractedTitle ? (
              <p className="text-muted-foreground">
                标题: <span className="text-foreground font-medium">{extractedTitle}</span>
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                在文章开头使用 # 添加标题
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !extractedTitle}>
              {isSaving ? '保存中...' : '保存文章'}
            </Button>
          </div>
        </div>

        {/* 编辑器和预览区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 编辑区 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">编辑 (Markdown + HTML)</Label>
              {isUploading && (
                <span className="text-xs text-muted-foreground">上传中...</span>
              )}
            </div>
            <Textarea
              ref={editorRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
              onPaste={handlePaste}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              placeholder="# 文章标题&#10;&#10;在这里开始写作...&#10;&#10;提示：可直接粘贴或拖放图片"
              className="h-[calc(100vh-320px)] min-h-96 font-mono text-sm resize-none"
              disabled={isSaving || isUploading}
            />
          </div>

          {/* 预览区 */}
          <div className="space-y-2">
            <Label>预览</Label>
            <div
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="h-[calc(100vh-320px)] min-h-96 p-4 border rounded-md bg-background overflow-y-auto"
            >
              <MarkdownPreview content={content} />
            </div>
          </div>
        </div>

        {/* 封面图片（底部） */}
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="coverImage">封面图片 URL（可选，留空则 AI 自动生成）</Label>
          <Input
            id="coverImage"
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={isSaving}
          />
          {coverImage && (
            <div className="mt-2 rounded-md overflow-hidden border border-border max-w-md">
              <img
                src={coverImage}
                alt="封面预览"
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
