import { useState } from 'react'
import { Github, X, Loader2 } from 'lucide-react'
import { getGitHubAuthUrl } from '@/lib/auth'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    try {
      const { url, state } = await getGitHubAuthUrl()
      // 存储 state 到 sessionStorage 用于验证
      sessionStorage.setItem('oauth_state', state)
      window.location.href = url
    } catch (error) {
      console.error('Failed to get auth URL:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            登录 MindPost
          </h2>
          <p className="text-muted-foreground mb-8">
            使用 GitHub 账号登录以管理文章
          </p>

          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Github className="w-5 h-5" />
            )}
            {isLoading ? '跳转中...' : '使用 GitHub 登录'}
          </button>
        </div>
      </div>
    </div>
  )
}
