import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { KeyboardEvent, UIEvent } from 'react'
import { useState, useMemo, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MarkdownPreview } from '@/components/markdown-preview'
import { createPost } from '@/lib/post.api'

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

  // 滚动同步相关的 refs
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null)

  // 从内容中提取标题
  const extractedTitle = useMemo(() => extractTitle(content), [content])

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
            <Label htmlFor="content">编辑 (Markdown + HTML)</Label>
            <Textarea
              ref={editorRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
              placeholder="# 文章标题&#10;&#10;在这里开始写作..."
              className="h-[calc(100vh-320px)] min-h-96 font-mono text-sm resize-none"
              disabled={isSaving}
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
