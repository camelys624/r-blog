import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create sample topics
  const techTopic = await prisma.topic.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'Technology',
      slug: 'technology',
      description: 'All things tech-related',
    },
  })

  const jsTopic = await prisma.topic.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: {
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript programming language',
      parentId: techTopic.id,
    },
  })

  // Create sample note
  const note = await prisma.note.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: 'Hello World',
      slug: 'hello-world',
      content: '# Hello World\n\nThis is my first blog post!',
      published: true,
      topics: {
        create: [
          { topicId: jsTopic.id },
        ],
      },
    },
  })

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project' },
    update: {},
    create: {
      id: 'sample-project',
      title: 'My Blog',
      description: 'A personal blog built with Next.js',
      content: 'This blog features markdown editing, topic management, and more!',
      status: 'PUBLISHED',
      url: 'https://github.com/user/my-blog',
    },
  })

  console.log('Seeding completed!')
  console.log({ techTopic, jsTopic, note, project })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
