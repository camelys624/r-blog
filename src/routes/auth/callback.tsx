import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { handleGitHubCallback } from '@/lib/auth'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function setCookie(name: string, value: string, expires: Date) {
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const errorParam = params.get('error')

    if (errorParam) {
      setStatus('error')
      setError(params.get('error_description') || '授权失败')
      return
    }

    if (!code || !state) {
      setStatus('error')
      setError('缺少授权参数')
      return
    }

    // 验证 state
    const storedState = sessionStorage.getItem('oauth_state')
    if (!storedState || storedState !== state) {
      setStatus('error')
      setError('安全验证失败，请重新登录')
      return
    }

    // 清除存储的 state
    sessionStorage.removeItem('oauth_state')

    handleGitHubCallback({ data: { code, state } })
      .then((result) => {
        // 在客户端设置 cookie
        setCookie('session_token', result.sessionToken, new Date(result.expires))
        setStatus('success')
        setTimeout(() => {
          navigate({ to: '/' })
        }, 1500)
      })
      .catch((err) => {
        setStatus('error')
        setError(err.message || '登录失败')
      })
  }, [navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
            <p className="text-lg text-foreground">正在登录...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg text-foreground">登录成功！</p>
            <p className="text-muted-foreground">正在跳转...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-foreground">登录失败</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="px-5 py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition"
            >
              返回首页
            </button>
          </>
        )}
      </div>
    </div>
  )
}
