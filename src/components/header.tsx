import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, LogOut, User } from 'lucide-react'
import { LoginModal } from './login-modal'
import { getCurrentUser, logout } from '@/lib/auth'

type UserInfo = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: 'USER' | 'ADMIN'
} | null

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return undefined
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

export function Header() {
  const [user, setUser] = useState<UserInfo>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const sessionToken = getCookie('session_token')
    if (!sessionToken) {
      setIsLoading(false)
      return
    }

    getCurrentUser({ data: { sessionToken } })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const handleLogout = async () => {
    const sessionToken = getCookie('session_token')
    if (sessionToken) {
      await logout({ data: { sessionToken } })
    }
    deleteCookie('session_token')
    setUser(null)
    setShowUserMenu(false)
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter">
            MIND<span className="text-accent">POST</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-10 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-accent transition">
              首页
            </Link>
            <a href="#" className="hover:text-accent transition">
              分类
            </a>
            <a href="#" className="hover:text-accent transition">
              关于
            </a>
          </nav>

          <div className="flex items-center space-x-6">
            <button className="p-2 text-muted-foreground hover:text-accent transition">
              <Search className="w-5 h-5" />
            </button>

            {isLoading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* 管理员显示管理和写文章按钮 */}
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="hidden md:block px-4 py-2 text-sm text-muted-foreground hover:text-accent transition"
                    >
                      管理
                    </Link>
                    <Link
                      to="/editor"
                      className="hidden md:block px-5 py-2.5 bg-foreground text-background text-sm rounded-full font-medium hover:opacity-90 transition"
                    >
                      写文章
                    </Link>
                  </>
                )}

                {/* 用户头像和菜单 */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-9 h-9 rounded-full border-2 border-border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-medium text-foreground truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                          {isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
                              管理员
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>退出登录</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden md:block px-5 py-2.5 bg-foreground text-background text-sm rounded-full font-medium hover:opacity-90 transition"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}
