import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { createPostCore } from '@/lib/post.api'

export const Route = createFileRoute('/api/posts')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const data = body.data || body
          const result = await createPostCore(data)
          return json(result, { status: 201 })
        } catch (error) {
          return json(
            { error: error instanceof Error ? error.message : '创建失败' },
            { status: 400 }
          )
        }
      },
    },
  },
})
