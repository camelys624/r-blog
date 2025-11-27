import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, slug, published = false, topicIds = [] } = body

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase with hyphens only (e.g., my-note-title)' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingNote = await prisma.note.findUnique({
      where: { slug },
    })

    if (existingNote) {
      return NextResponse.json(
        { error: 'A note with this slug already exists' },
        { status: 409 }
      )
    }

    // Create the note with optional topic connections
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content || '',
        slug: slug.trim(),
        published,
        topics: topicIds.length > 0 ? {
          create: topicIds.map((topicId: string) => ({
            topicId,
          })),
        } : undefined,
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where = {
      deletedAt: null,
      ...(published !== null && { published: published === 'true' }),
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
      }),
      prisma.note.count({ where }),
    ])

    return NextResponse.json({
      notes,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}
