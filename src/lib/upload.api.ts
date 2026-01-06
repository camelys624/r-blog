import { createServerFn } from '@tanstack/react-start'
import { uploadImage } from './image-host'

interface UploadImageInput {
  /** base64 编码的图片数据 */
  imageBase64: string
  /** 可选的文件名 */
  name?: string
}

/**
 * 上传图片到图床
 * 接收 base64 编码的图片，返回永久 URL
 */
export const uploadImageToHost = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const data = ctx.data as unknown as UploadImageInput

    if (!data?.imageBase64) {
      throw new Error('图片数据不能为空')
    }

    try {
      const url = await uploadImage(data.imageBase64, data.name)
      return { url }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : '图片上传失败，请重试'
      )
    }
  }
)
