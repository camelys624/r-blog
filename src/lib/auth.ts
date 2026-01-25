import { createServerFn } from '@tanstack/react-start'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Prisma 单例
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

// 生成随机 session token
function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

// GitHub OAuth 配置
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/callback'

// 获取 GitHub 授权 URL
export const getGitHubAuthUrl = createServerFn({ method: 'GET' }).handler(
  async () => {
    const state = generateSessionToken()

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'read:user user:email',
      state,
    })

    return {
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
      state,
    }
  }
)

// 处理 GitHub OAuth 回调
export const handleGitHubCallback = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { code } = ctx.data as { code: string; state: string }

    // 用 code 换取 access token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
        }),
      }
    )

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to get access token')
    }

    const accessToken = tokenData.access_token

    // 获取 GitHub 用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    const githubUser = await userResponse.json()

    // 获取用户邮箱
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    const emails = await emailsResponse.json()
    const primaryEmail = emails.find((e: { primary: boolean }) => e.primary)?.email || githubUser.email

    const prisma = getPrisma()

    // 查找或创建用户
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: String(githubUser.id),
        },
      },
      include: { user: true },
    })

    let user
    if (account) {
      // 更新 token
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: accessToken,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
        },
      })
      user = account.user
    } else {
      // 创建新用户和账号
      user = await prisma.user.create({
        data: {
          name: githubUser.name || githubUser.login,
          email: primaryEmail,
          image: githubUser.avatar_url,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'github',
              providerAccountId: String(githubUser.id),
              access_token: accessToken,
              token_type: tokenData.token_type,
              scope: tokenData.scope,
            },
          },
        },
      })
    }

    // 创建 session
    const sessionToken = generateSessionToken()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 天

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    })

    return {
      sessionToken,
      expires: expires.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    }
  }
)

// 获取当前用户 - 通过 session token
export const getCurrentUser = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { sessionToken } = ctx.data as { sessionToken?: string }

    if (!sessionToken) {
      return null
    }

    const prisma = getPrisma()

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (!session || session.expires < new Date()) {
      return null
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    }
  }
)

// 登出 - 删除 session
export const logout = createServerFn({ method: 'POST' }).handler(async (ctx) => {
  const { sessionToken } = ctx.data as { sessionToken: string }

  if (sessionToken) {
    const prisma = getPrisma()
    await prisma.session.delete({
      where: { sessionToken },
    }).catch(() => {
      // Session 可能已经不存在
    })
  }

  return { success: true }
})
