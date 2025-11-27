// Re-export Prisma types for use throughout the application
export type {
  Note,
  Topic,
  Project,
  NoteTopic,
  ProjectStatus,
} from '@prisma/client'

// Export Prisma Client instance
export { prisma } from './prisma'

// API Response types
export interface NoteWithTopics {
  id: string
  title: string
  content: string
  slug: string
  published: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  topics: {
    topic: {
      id: string
      name: string
      slug: string
    }
  }[]
}

export interface TopicWithNotes {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  notes: {
    note: {
      id: string
      title: string
      slug: string
      published: boolean
    }
  }[]
  children?: TopicWithNotes[]
}

export interface ProjectResponse {
  id: string
  title: string
  description: string | null
  content: string | null
  url: string | null
  imageUrl: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}
