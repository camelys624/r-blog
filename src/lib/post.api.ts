import { createServerFn } from '@tanstack/react-start'
import type { PrismaClient } from '@prisma/client'
import { generateSummary, generateCoverImage, generateMetadata } from './ai'
import { validateApiKey } from './api-key'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // 保留中文字符
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

interface CreatePostInput {
  content: string
  coverImage?: string
  status?: 'DRAFT' | 'PUBLISHED'
  apiKey?: string // API Key 认证
  sessionToken?: string // Session 认证
}

// 创建单例 prisma client
let prismaInstance: PrismaClient | null = null

async function getPrisma(): Promise<PrismaClient> {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const pg = await import('pg')
    const pool = new pg.default.Pool({
      connectionString: process.env.DATABASE_URL,
    })
    const adapter = new PrismaPg(pool)
    prismaInstance = new PrismaClient({ adapter })
  }
  return prismaInstance
}

// 验证用户权限（API Key 或 Session）
async function authenticateAdmin(data: { apiKey?: string; sessionToken?: string }) {
  const prisma = await getPrisma()

  // 优先使用 API Key
  if (data.apiKey) {
    const user = await validateApiKey(data.apiKey)
    if (!user) {
      throw new Error('API Key 无效或已过期')
    }
    if (user.role !== 'ADMIN') {
      throw new Error('无权限执行此操作')
    }
    return user
  }

  // 其次使用 Session
  if (data.sessionToken) {
    const session = await prisma.session.findUnique({
      where: { sessionToken: data.sessionToken },
      include: { user: true },
    })
    if (!session || session.expires < new Date()) {
      throw new Error('未登录或会话已过期')
    }
    if (session.user.role !== 'ADMIN') {
      throw new Error('无权限执行此操作')
    }
    return session.user
  }

  throw new Error('需要提供 API Key 或登录凭证')
}

// 核心创建文章逻辑（可从 API route 直接调用）
export async function createPostCore(data: CreatePostInput) {
  if (!data?.content?.trim()) {
    throw new Error('内容不能为空')
  }

  // 验证权限
  const user = await authenticateAdmin(data)

  const prisma = await getPrisma()
  const content = data.content.trim()

  // 使用 AI 生成元数据（标题、分类、标签）
  let metadata: { title: string; category: string; tags: string[] }
  try {
    metadata = await generateMetadata(content)
  } catch (error) {
    console.error('AI 元数据生成失败:', error)
    // 回退方案：从内容提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m)
    metadata = {
      title: titleMatch ? titleMatch[1].trim() : '无标题文章',
      category: '未分类',
      tags: [],
    }
  }

  const slug = generateSlug(metadata.title)

  // 检查 slug 是否已存在，如果存在则添加时间戳
  const existingPost = await prisma.post.findUnique({ where: { slug } })
  const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug

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

  // 获取或创建标签
  const tagRecords = await Promise.all(
    metadata.tags.map(async (tagName) => {
      let tag = await prisma.tag.findFirst({
        where: { name: tagName },
      })
      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            slug: generateSlug(tagName),
          },
        })
      }
      return tag
    })
  )

  // 使用 AI 生成摘要
  let summary: string | undefined
  try {
    summary = await generateSummary(metadata.title, content)
  } catch (error) {
    console.error('AI 摘要生成失败:', error)
    summary = content.slice(0, 150) + '...'
  }

  // 处理封面图：如果用户未提供，则使用 AI 生成
  let coverImage: string | undefined = data.coverImage
  if (!coverImage) {
    try {
      coverImage = await generateCoverImage(metadata.title, content)
    } catch (error) {
      console.error('AI 封面生成失败:', error)
    }
  }

  const post = await prisma.post.create({
    data: {
      title: metadata.title,
      content: content,
      slug: finalSlug,
      status: data.status || 'DRAFT',
      authorId: user.id,
      categoryId: category.id,
      tags: {
        connect: tagRecords.map((tag) => ({ id: tag.id })),
      },
      summary,
      coverImage,
    },
    include: {
      category: true,
      tags: true,
      author: true,
    },
  })

  return post
}

export const createPost = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const data = ctx.data as unknown as CreatePostInput
    return createPostCore(data)
  })

export const getPosts = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const data = ctx.data as { status?: 'DRAFT' | 'PUBLISHED' | 'ALL' } | undefined
    const status = data?.status
    const prisma = await getPrisma()

    const posts = await prisma.post.findMany({
      where: status && status !== 'ALL' ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { category: true, tags: true, author: true },
    })

    return posts
  })

export const getPostBySlug = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const slug = ctx.data as unknown as string

    if (!slug) {
      throw new Error('slug 不能为空')
    }

    const prisma = await getPrisma()

    const post = await prisma.post.findUnique({
      where: { slug },
      include: { category: true, tags: true, author: true },
    })

    if (!post) {
      throw new Error('文章不存在')
    }

    return post
  })

// 删除文章
export const deletePost = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { id } = ctx.data as { id: string }

    if (!id) {
      throw new Error('文章 ID 不能为空')
    }

    const prisma = await getPrisma()

    await prisma.post.update({
      where: { id },
      data: { tags: { set: [] } },
    })

    await prisma.post.delete({
      where: { id },
    })

    return { success: true }
  }
)

// 更新文章状态
export const updatePostStatus = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { id, status } = ctx.data as { id: string; status: 'DRAFT' | 'PUBLISHED' }

    if (!id) {
      throw new Error('文章 ID 不能为空')
    }

    const prisma = await getPrisma()

    const post = await prisma.post.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      include: { category: true, tags: true, author: true },
    })

    return post
  }
)

// 更新文章内容
export const updatePost = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { id, content, coverImage, sessionToken } = ctx.data as {
      id: string
      content: string
      coverImage?: string
      sessionToken?: string
    }

    if (!id) {
      throw new Error('文章 ID 不能为空')
    }

    if (!content?.trim()) {
      throw new Error('内容不能为空')
    }

    // 验证权限
    const prisma = await getPrisma()

    if (!sessionToken) {
      throw new Error('需要登录')
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      throw new Error('未登录或会话已过期')
    }

    if (session.user.role !== 'ADMIN') {
      throw new Error('无权限执行此操作')
    }

    // 从内容提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : undefined

    const post = await prisma.post.update({
      where: { id },
      data: {
        content: content.trim(),
        ...(title && { title }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
      },
      include: { category: true, tags: true, author: true },
    })

    return post
  }
)

// 获取文章详情（通过 ID）
export const getPostById = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    const id = ctx.data as unknown as string

    if (!id) {
      throw new Error('文章 ID 不能为空')
    }

    const prisma = await getPrisma()

    const post = await prisma.post.findUnique({
      where: { id },
      include: { category: true, tags: true, author: true },
    })

    if (!post) {
      throw new Error('文章不存在')
    }

    return post
  }
)
