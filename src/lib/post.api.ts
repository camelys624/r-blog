import { createServerFn } from '@tanstack/react-start'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { generateSummary, generateCoverImage, generateMetadata } from './ai'

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
}

// 创建单例 prisma client
let prismaInstance: PrismaClient | null = null

function getPrisma() {
  if (!prismaInstance) {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    })
    const adapter = new PrismaPg(pool)
    prismaInstance = new PrismaClient({ adapter })
  }
  return prismaInstance
}

export const createPost = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const data = ctx.data as unknown as CreatePostInput

    if (!data?.content?.trim()) {
      throw new Error('内容不能为空')
    }

    const prisma = getPrisma()
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
      },
    })

    return post
  })

export const getPosts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const prisma = getPrisma()

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, tags: true },
    })
    return posts
  })

export const getPostBySlug = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const slug = ctx.data as unknown as string

    if (!slug) {
      throw new Error('slug 不能为空')
    }

    const prisma = getPrisma()

    const post = await prisma.post.findUnique({
      where: { slug },
      include: { category: true, tags: true },
    })

    if (!post) {
      throw new Error('文章不存在')
    }

    return post
  })
