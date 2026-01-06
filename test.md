# 博客系统开发记录：AI 驱动的内容创作体验

今天对博客系统进行了一次重要的功能迭代，核心目标是让编辑体验更加专注于写作本身，将繁琐的元数据管理交给 AI 处理。

## 编辑器改进

### 移除手动输入，专注写作

之前的编辑器需要手动填写标题、分类等信息，这打断了写作的连贯性。现在，编辑器只保留一个 Markdown 文本框，所有元数据都从文章内容中自动提取或生成：

```tsx
// 从 Markdown 内容中提取标题（第一个 H1）
function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}
```

写作时只需在开头用 `# 标题` 的格式写上文章标题，系统会自动识别并显示在页面顶部。

### 同步滚动

分栏式编辑器的一个常见需求是编辑区和预览区的滚动联动。实现思路是计算滚动百分比，然后同步应用到另一侧：

```tsx
const handleEditorScroll = useCallback((e: UIEvent<HTMLTextAreaElement>) => {
  if (isScrollingRef.current === 'preview') return
  isScrollingRef.current = 'editor'

  const editor = e.currentTarget
  const preview = previewRef.current
  if (!preview) return

  // 计算滚动百分比并应用
  const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
  preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)

  requestAnimationFrame(() => {
    isScrollingRef.current = null
  })
}, [])
```

使用 `isScrollingRef` 标记当前滚动源，避免两侧互相触发形成死循环。

## AI 元数据生成

这是今天最核心的改进。通过 Azure OpenAI 的 GPT-4o-mini 模型，从文章内容中自动分析并生成：

- **标题**：优先从 H1 提取，无则根据内容生成
- **分类**：根据文章主题智能分类（技术、生活、教程等）
- **标签**：提取 3-5 个关键词

```typescript
export async function generateMetadata(content: string): Promise<PostMetadata> {
  const response = await client.chat.completions.create({
    model: CHAT_DEPLOYMENT,
    messages: [
      {
        role: 'system',
        content: `你是一个专业的内容分析师。请分析文章内容，提取或生成以下信息：
1. 标题：从文章中提取第一个 # 开头的标题
2. 分类：根据文章主题选择一个最合适的分类
3. 标签：提取 3-5 个关键词作为标签

请以 JSON 格式输出...`,
      },
      { role: 'user', content: truncatedContent },
    ],
    temperature: 0.3, // 低温度确保输出稳定
  })

  return JSON.parse(result) as PostMetadata
}
```

### 自动创建分类和标签

AI 生成的分类和标签会自动与数据库同步：

```typescript
// 获取或创建分类
let category = await prisma.category.findFirst({
  where: { name: metadata.category },
})
if (!category) {
  category = await prisma.category.create({
    data: {
      name: metadata.category,
      slug: generateSlug(metadata.category),
    },
  })
}
```

这样既保证了数据的一致性，又避免了重复创建。

## OpenSpec 规范管理

项目使用 OpenSpec 进行规范驱动开发。今天整理了之前的变更记录，将实际实现与规范文档对齐：

```
openspec/specs/
├── content-editing/     # 编辑器功能规范 (7 个需求)
├── content-management/  # 内容管理规范 (5 个需求)
└── media-management/    # 媒体管理规范 (3 个需求)
```

每个功能都有明确的需求定义和场景描述，便于后续维护和迭代。

## 待优化项

### 图片存储问题

目前 DALL-E 3 生成的封面图片 URL 是临时的，会在一段时间后过期。后续需要：

1. 接入免费图床服务（如 SM.MS、imgbb 等）
2. 生成图片后自动上传到图床
3. 将永久链接存储到数据库

### 编辑器图片粘贴

当前编辑器不支持直接粘贴图片。计划实现：

1. 监听 paste 事件，检测剪贴板中的图片
2. 自动上传到图床
3. 插入 Markdown 图片语法 `![](url)`

这两个功能会在后续版本中实现。

## 总结

今天的改进让博客系统的内容创作体验更加流畅：

- 写作时无需关心元数据，专注内容本身
- AI 自动处理分类、标签、摘要、封面
- 同步滚动让预览更加直观
- 规范文档保证项目的可维护性

技术栈：TanStack Start + React 19 + Prisma + Azure OpenAI

---

# 2026-01-06: 图床集成功能实现

上次提到的"待优化项"今天全部完成！现在图片上传体验已经非常顺滑。

## 新增文件

### `src/lib/image-host.ts` - imgbb 图床客户端

```typescript
// 上传图片到 imgbb（支持 base64 或 File）
export async function uploadImage(image: string | File, name?: string): Promise<string>

// 从 URL 下载图片并上传（用于 DALL-E 临时图片）
export async function uploadImageFromUrl(imageUrl: string, name?: string): Promise<string>
```

核心逻辑是将图片转为 base64，通过 FormData 发送到 imgbb API：

```typescript
const formData = new FormData()
formData.append('key', apiKey)
formData.append('image', base64)

const response = await fetch('https://api.imgbb.com/1/upload', {
  method: 'POST',
  body: formData,
})
```

### `src/lib/upload.api.ts` - 服务端上传接口

使用 TanStack Start 的 Server Function，保护 API Key 不暴露到客户端：

```typescript
export const uploadImageToHost = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const data = ctx.data as unknown as UploadImageInput
    const url = await uploadImage(data.imageBase64, data.name)
    return { url }
  }
)
```

## 修改文件

### `src/lib/ai.ts` - AI 封面图永久化

DALL-E 生成的图片现在会自动上传到 imgbb：

```typescript
const tempImageUrl = imageResponse.data?.[0]?.url

// 上传到 imgbb 获取永久 URL
try {
  const permanentUrl = await uploadImageFromUrl(tempImageUrl, `cover-${Date.now()}`)
  return permanentUrl
} catch (uploadError) {
  // 上传失败时回退到临时 URL
  console.warn('封面图片上传到图床失败，使用临时 URL:', uploadError)
  return tempImageUrl
}
```

### `src/routes/editor.tsx` - 编辑器图片粘贴/拖放

新增三个事件处理函数：

```typescript
// 粘贴图片
const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
  const items = e.clipboardData?.items
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) await uploadAndInsertImage(file)
      break
    }
  }
}

// 拖拽悬停
const handleDragOver = (e: DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault()
  e.stopPropagation()
}

// 拖放图片
const handleDrop = async (e: DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault()
  const files = e.dataTransfer?.files
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await uploadAndInsertImage(file)
    }
  }
}
```

上传后自动在光标位置插入 Markdown 图片语法：

```typescript
insertTextAtCursor(`![${imageName}](${result.url})\n`)
```

## 功能测试清单

| 测试项 | 操作 | 预期结果 |
|--------|------|----------|
| 粘贴图片 | 复制图片后 Ctrl+V | 显示上传 toast，完成后插入 `![name](url)` |
| 拖放单张图片 | 拖拽图片到编辑区 | 自动上传并插入 Markdown |
| 拖放多张图片 | 同时拖放多张 | 依次上传，分别插入 |
| AI 封面生成 | 保存文章（不填封面） | 生成图片并上传到 imgbb |
| 大文件限制 | 上传 >32MB 图片 | 显示大小限制错误 |
| API Key 缺失 | 移除 IMGBB_API_KEY | 显示配置错误提示 |

## 环境变量

```env
# 新增
IMGBB_API_KEY=your_imgbb_api_key
```

## 技术要点

1. **API Key 安全**：通过 Server Function 代理上传，客户端不接触密钥
2. **优雅降级**：imgbb 上传失败时，AI 封面仍返回临时 URL
3. **用户体验**：toast 通知上传进度，编辑区在上传时禁用防止误操作
4. **文件校验**：检查 MIME 类型和文件大小（32MB 限制）

至此，"待优化项"中的两个功能已全部实现：
- ✅ 图片存储问题 → imgbb 图床集成
- ✅ 编辑器图片粘贴 → 粘贴 + 拖放双支持

---

## Bug 修复：AI 封面图未上传到 imgbb

### 问题描述
AI 生成的封面图没有上传到 imgbb，仍然使用 DALL-E 返回的临时 URL。

### 原因分析
`src/lib/image-host.ts` 中的 `uploadImageFromUrl` 函数使用了 `FileReader` API，这是浏览器专用 API。但该函数在服务端（TanStack Start Server Function）运行，Node.js 环境没有 `FileReader`，导致静默失败。

### 解决方案
将 `blobToBase64` 改为使用 Node.js 兼容的 `Buffer` API：

```typescript
// 修复前（浏览器专用，服务端不可用）
const blob = await imageResponse.blob()
const base64 = await blobToBase64(blob)  // FileReader 在 Node.js 不存在

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()  // ❌ Node.js 没有 FileReader
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 修复后（Node.js 兼容）
const arrayBuffer = await imageResponse.arrayBuffer()
const base64 = Buffer.from(arrayBuffer).toString('base64')  // ✅ Node.js 原生支持
```

### 修改文件
- `src/lib/image-host.ts`：重写 `uploadImageFromUrl` 函数，使用 `Buffer.from().toString('base64')`
- `src/lib/ai.ts`：添加调试日志输出

### 验证方法
1. 保存一篇新文章（不填封面图）
2. 查看服务端控制台日志：
   ```
   开始上传封面图到 imgbb...
   封面图上传成功: https://i.ibb.co/xxx/cover-xxx.png
   ```
3. 检查数据库中 `coverImage` 字段是否为 `i.ibb.co` 域名


