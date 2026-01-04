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
