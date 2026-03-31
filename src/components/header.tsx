import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, LogOut, User, Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
  const isDark = resolvedTheme === 'dark'

  const navLinks = [
    { label: '首页', href: '/' as const, isRoute: true },
    { label: '分类', href: '#', isRoute: false },
    { label: '关于', href: '#', isRoute: false },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-black tracking-tighter shrink-0">
            MIND<span className="text-accent">POST</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link key={link.label} to={link.href as '/'} className="hover:text-accent transition-colors">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="hover:text-accent transition-colors">
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <button className="p-2 text-muted-foreground hover:text-accent transition-colors rounded-lg hover:bg-muted">
              <Search className="w-4 h-4" />
            </button>

            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 text-muted-foreground hover:text-accent transition-colors rounded-lg hover:bg-muted"
                aria-label="切换深色模式"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Auth area — desktop only */}
            <div className="hidden md:flex items-center space-x-3 ml-1">
              {isLoading ? (
                <div className="w-20 h-8 bg-muted animate-pulse rounded-full" />
              ) : user ? (
                <div className="flex items-center space-x-3">
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        className="px-3 py-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
                      >
                        管理
                      </Link>
                      <Link
                        to="/editor"
                        className="px-4 py-1.5 bg-foreground text-background text-sm rounded-full font-medium hover:opacity-85 transition-opacity"
                      >
                        写文章
                      </Link>
                    </>
                  )}

                  {/* User avatar dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center"
                    >
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="w-8 h-8 rounded-full border-2 border-border object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
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
                        <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                          <div className="px-4 py-3 border-b border-border">
                            <p className="font-semibold text-foreground truncate text-sm">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {user.email}
                            </p>
                            {isAdmin && (
                              <span className="inline-block mt-1.5 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                                管理员
                              </span>
                            )}
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-2"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            退出登录
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-1.5 bg-foreground text-background text-sm rounded-full font-medium hover:opacity-85 transition-opacity"
                >
                  登录
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-accent transition-colors rounded-lg hover:bg-muted"
              aria-label="打开菜单"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col space-y-1">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.label}
                    to={link.href as '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}

              {/* Mobile auth */}
              <div className="pt-3 mt-1 border-t border-border">
                {isLoading ? (
                  <div className="w-24 h-8 bg-muted animate-pulse rounded-full" />
                ) : user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2">
                      {user.image ? (
                        <img src={user.image} alt={user.name || ''} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground">{user.name}</span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded-full">管理员</span>
                      )}
                    </div>
                    {isAdmin && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
                        >
                          管理后台
                        </Link>
                        <Link
                          to="/editor"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
                        >
                          写文章
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      退出登录
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setIsLoginModalOpen(true); setMobileMenuOpen(false) }}
                    className="w-full px-4 py-2 bg-foreground text-background text-sm rounded-full font-medium hover:opacity-85 transition-opacity"
                  >
                    登录
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}
