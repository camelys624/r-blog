import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// 加载 .env.local 文件
config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  schema: path.resolve(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DIRECT_URL!,
  },
})
