import { createServerFn } from '@tanstack/react-start'
import type { PrismaClient } from '@prisma/client'

// Prisma 单例
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

// 生成 API Key (sk_ 前缀 + 32字符随机串)
function generateApiKey(): string {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  const key = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
  return `sk_${key}`
}

// 创建 API Key
export const createApiKey = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { sessionToken, name, expiresInDays } = ctx.data as {
      sessionToken: string
      name: string
      expiresInDays?: number
    }

    const prisma = await getPrisma()

    // 验证 session 并获取用户
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      throw new Error('未登录或会话已过期')
    }

    if (session.user.role !== 'ADMIN') {
      throw new Error('无权限创建 API Key')
    }

    const key = generateApiKey()
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        userId: session.user.id,
        expiresAt,
      },
    })

    // 返回完整 key（仅此一次显示）
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key, // 完整 key，仅创建时返回
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    }
  }
)

// 获取用户的 API Key 列表
export const getApiKeys = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { sessionToken } = ctx.data as { sessionToken: string }

    const prisma = await getPrisma()

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      throw new Error('未登录或会话已过期')
    }

    if (session.user.role !== 'ADMIN') {
      throw new Error('无权限查看 API Key')
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true, // 返回部分遮蔽的 key
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    // 遮蔽 key，只显示前缀和最后4位
    return apiKeys.map((k) => ({
      ...k,
      key: `${k.key.slice(0, 7)}...${k.key.slice(-4)}`,
    }))
  }
)

// 删除 API Key
export const deleteApiKey = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { sessionToken, id } = ctx.data as {
      sessionToken: string
      id: string
    }

    const prisma = await getPrisma()

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      throw new Error('未登录或会话已过期')
    }

    // 确保只能删除自己的 key
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!apiKey) {
      throw new Error('API Key 不存在')
    }

    await prisma.apiKey.delete({
      where: { id },
    })

    return { success: true }
  }
)

// 验证 API Key 并返回用户信息
export async function validateApiKey(key: string) {
  const prisma = await getPrisma()

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: true },
  })

  if (!apiKey) {
    return null
  }

  // 检查是否过期
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null
  }

  // 更新最后使用时间
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKey.user
}
