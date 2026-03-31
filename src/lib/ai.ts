import type { AzureOpenAI } from 'openai'
import { uploadImageFromUrl } from './image-host'

// Azure OpenAI 客户端单例
let clientInstance: AzureOpenAI | null = null

async function getClient(): Promise<AzureOpenAI> {
  if (!clientInstance) {
    const { AzureOpenAI } = await import('openai')
    clientInstance = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
    })
  }
  return clientInstance
}

// Azure OpenAI 部署名称
const CHAT_DEPLOYMENT = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4o-mini'
const IMAGE_DEPLOYMENT = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT || 'FLUX.2-pro'

/**
 * 使用 Azure OpenAI DALL-E 生成文章封面图片
 */
export async function generateCoverImage(title: string, content: string): Promise<string> {
  const client = await getClient()

  // 截取内容前 500 字符用于生成提示词
  const truncatedContent = content.slice(0, 500)

  // 先用 GPT 生成图片描述（针对 FLUX 优化）
  const promptResponse = await client.chat.completions.create({
    model: CHAT_DEPLOYMENT,
    messages: [
      {
        role: 'system',
        content: `You are a creative art director specializing in editorial photography and digital art. Based on the article title and content, write a detailed image generation prompt in English (max 150 words) optimized for FLUX image models.

Structure your prompt with:
1. Main subject or scene that visually represents the article's core idea
2. Art style (e.g. cinematic photography, digital illustration, abstract art, editorial)
3. Lighting and atmosphere (e.g. soft diffused light, dramatic shadows, golden hour)
4. Color palette — 2–3 specific colors that match the article's emotional tone
5. Composition (e.g. wide angle, shallow depth of field, symmetrical)

Rules:
- Use vivid, specific descriptors — avoid vague words like "nice" or "beautiful"
- No text, labels, watermarks, or UI elements in the image
- Optimized for a wide-format blog cover (landscape orientation)
- Output only the prompt, no explanation or preamble`,
      },
      {
        role: 'user',
        content: `Title: ${title}\n\nContent: ${truncatedContent}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.8,
  })

  const imagePrompt = promptResponse.choices[0]?.message?.content?.trim()

  if (!imagePrompt) {
    throw new Error('Failed to generate image prompt')
  }

  // 使用 FLUX.2-pro 生成图片
  const imageResponse = await client.images.generate({
    model: IMAGE_DEPLOYMENT,
    prompt: `${imagePrompt} Blog cover image, high resolution, no text, no watermarks.`,
    n: 1,
    size: '1792x1024',
  })

  const tempImageUrl = imageResponse.data?.[0]?.url

  if (!tempImageUrl) {
    throw new Error('Failed to generate cover image')
  }

  // 上传到 imgbb 获取永久 URL
  try {
    console.log('开始上传封面图到 imgbb...')
    const permanentUrl = await uploadImageFromUrl(
      tempImageUrl,
      `cover-${Date.now()}`
    )
    console.log('封面图上传成功:', permanentUrl)
    return permanentUrl
  } catch (uploadError) {
    // 如果上传失败，返回临时 URL 并记录警告
    console.error('封面图片上传到图床失败:', uploadError)
    return tempImageUrl
  }
}

/**
 * 使用 Azure OpenAI GPT 生成文章摘要
 */
export async function generateSummary(title: string, content: string): Promise<string> {
  const client = await getClient()

  // 截取内容前 3000 字符，避免 token 过多
  const truncatedContent = content.slice(0, 3000)

  const response = await client.chat.completions.create({
    model: CHAT_DEPLOYMENT,
    messages: [
      {
        role: 'system',
        content: '你是一个专业的内容编辑。请根据文章标题和内容，生成一段简洁的中文摘要（100-150字）。摘要应该概括文章的核心观点和主要内容，吸引读者阅读全文。只输出摘要内容，不要包含任何前缀或解释。',
      },
      {
        role: 'user',
        content: `标题：${title}\n\n内容：${truncatedContent}`,
      },
    ],
    max_tokens: 300,
    temperature: 0.7,
  })

  const summary = response.choices[0]?.message?.content?.trim()

  if (!summary) {
    throw new Error('AI 生成摘要失败')
  }

  return summary
}

/**
 * 文章元数据接口
 */
export interface PostMetadata {
  title: string
  category: string
  tags: string[]
}

/**
 * 使用 Azure OpenAI GPT 从文章内容中提取/生成元数据
 * 包括标题、分类和标签
 */
export async function generateMetadata(content: string): Promise<PostMetadata> {
  const client = await getClient()

  const truncatedContent = content.slice(0, 3000)

  const response = await client.chat.completions.create({
    model: CHAT_DEPLOYMENT,
    messages: [
      {
        role: 'system',
        content: `你是一个专业的内容分析师。请分析文章内容，提取或生成以下信息：

1. 标题：从文章中提取第一个 # 开头的标题，如果没有则根据内容生成一个简洁的中文标题
2. 分类：根据文章主题选择一个最合适的分类（如：技术、生活、随笔、教程、项目等）
3. 标签：提取 3-5 个关键词作为标签，使用中文

请以 JSON 格式输出，格式如下：
{
  "title": "文章标题",
  "category": "分类名称",
  "tags": ["标签1", "标签2", "标签3"]
}

只输出 JSON，不要包含其他内容。`,
      },
      {
        role: 'user',
        content: truncatedContent,
      },
    ],
    max_tokens: 300,
    temperature: 0.3,
  })

  const result = response.choices[0]?.message?.content?.trim()

  if (!result) {
    throw new Error('AI 生成元数据失败')
  }

  try {
    const parsed = JSON.parse(result) as PostMetadata
    if (!parsed.title || !parsed.category || !Array.isArray(parsed.tags)) {
      throw new Error('Invalid metadata format')
    }
    return parsed
  } catch {
    throw new Error('AI 返回的元数据格式无效')
  }
}
