/**
 * imgbb 图床客户端
 * API 文档: https://api.imgbb.com/
 */

const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'

// 将 ArrayBuffer 转换为 base64（兼容浏览器和 Node.js）
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

interface ImgbbResponse {
  success: boolean
  status: number
  data: {
    id: string
    title: string
    url: string
    url_viewer: string
    display_url: string
    delete_url: string
    image: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    thumb?: {
      url: string
    }
    medium?: {
      url: string
    }
  }
}

/**
 * 上传图片到 imgbb（服务端使用）
 * @param imageBase64 - base64 编码的图片数据
 * @param name - 可选的文件名
 * @returns 永久图片 URL
 */
export async function uploadImage(
  imageBase64: string,
  name?: string
): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY 环境变量未配置')
  }

  const formData = new FormData()
  formData.append('key', apiKey)
  formData.append('image', imageBase64)

  if (name) {
    formData.append('name', name)
  }

  const response = await fetch(IMGBB_API_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`图片上传失败: HTTP ${response.status} - ${text}`)
  }

  const result = (await response.json()) as ImgbbResponse

  if (!result.success) {
    throw new Error('图片上传失败')
  }

  return result.data.url
}

/**
 * 从 URL 下载图片并上传到 imgbb（服务端使用）
 * @param imageUrl - 图片 URL（例如 DALL-E 临时 URL）
 * @param name - 可选的文件名
 * @returns 永久图片 URL
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  name?: string
): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY 环境变量未配置')
  }

  // 下载图片
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error(`下载图片失败: HTTP ${imageResponse.status}`)
  }

  // 转换为 base64
  const arrayBuffer = await imageResponse.arrayBuffer()
  const base64 = arrayBufferToBase64(arrayBuffer)

  // 上传到 imgbb
  const formData = new FormData()
  formData.append('key', apiKey)
  formData.append('image', base64)
  if (name) {
    formData.append('name', name)
  }

  const response = await fetch(IMGBB_API_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`图片上传失败: HTTP ${response.status} - ${text}`)
  }

  const result = (await response.json()) as ImgbbResponse

  if (!result.success) {
    throw new Error('图片上传失败')
  }

  return result.data.medium?.url || result.data.url
}

/**
 * 将 File 转换为 base64（客户端使用）
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 移除 data:image/xxx;base64, 前缀
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
