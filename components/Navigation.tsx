'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, User, Menu, Heart, LogOut, Store, Settings } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

export default function Navigation() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    
    // Check current auth state
    async function checkAuth() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      setUser(null)
      setUserMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-[#E8E4E0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="HoardStash" 
              className="h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search craft supplies..."
                className="w-full pl-10 pr-4 py-2 border border-[#E8E4E0] rounded-full focus:outline-none focus:ring-2 focus:ring-[#7A8B6E] bg-[#F8F6F4]"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-[#6B5D4D]" />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-[#4A4035] hover:text-[#7A8B6E] transition-colors">
              Browse
            </Link>
            <Link href="/sell" className="text-[#4A4035] hover:text-[#7A8B6E] transition-colors">
              Sell
            </Link>
            <Link href="/favorites" className="p-2 hover:bg-[#F8F6F4] rounded-full transition-colors">
              <Heart className="w-6 h-6 text-[#4A4035]" />
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-[#F8F6F4] rounded-full transition-colors">
              <ShoppingBag className="w-6 h-6 text-[#4A4035]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7A8B6E] text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="w-10 h-10" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:bg-[#F8F6F4] rounded-full flex items-center gap-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#7A8B6E]/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#7A8B6E]" />
                  </div>
                  <span className="text-sm font-medium text-[#4A4035] hidden lg:block">
                    {user.email?.split('@')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E8E4E0] py-2 z-20">
                      <div className="px-4 py-2 border-b border-[#E8E4E0]">
                        <p className="font-medium text-[#4A4035] truncate">{user.email}</p>
                        <p className="text-xs text-[#7A8B6E]">● Signed In</p>
                      </div>
                      
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[#4A4035] hover:bg-[#F8F6F4] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      
                      <Link
                        href="/seller/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[#4A4035] hover:bg-[#F8F6F4] transition-colors"
                      >
                        <Store className="w-4 h-4" />
                        Seller Dashboard
                      </Link>
                      
                      <hr className="my-2 border-[#E8E4E0]" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-[#4A4035] hover:text-[#7A8B6E] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-[#7A8B6E] text-white rounded-full hover:bg-[#6B7A60] transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#4A4035]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8E4E0]">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-[#E8E4E0] rounded-lg bg-[#F8F6F4]"
              />
              <Link href="/browse" className="text-[#4A4035] hover:text-[#7A8B6E] py-2 transition-colors">
                Browse
              </Link>
              <Link href="/sell" className="text-[#4A4035] hover:text-[#7A8B6E] py-2 transition-colors">
                Sell
              </Link>
              <Link href="/favorites" className="text-[#4A4035] hover:text-[#7A8B6E] py-2 transition-colors">
                Favorites
              </Link>
              <Link href="/cart" className="text-[#4A4035] hover:text-[#7A8B6E] py-2 transition-colors">
                Cart ({cartCount})
              </Link>
              
              {user ? (
                <>
                  <hr className="border-[#E8E4E0]" />
                  <div className="px-4 py-2 bg-[#7A8B6E]/10 rounded-lg">
                    <p className="text-sm font-medium text-[#4A4035]">{user.email}</p>
                    <p className="text-xs text-[#7A8B6E]">● Signed In</p>
                  </div>
                  <Link href="/profile" className="text-[#4A4035] hover:text-[#7A8B6E] py-2 transition-colors">
                    Profile Settings
                  </Link>
                  <Link href="/seller/dashboard" className="text-[#4A4035] hover:text-[#7A8B6E] py-2 transition-colors">
                    Seller Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-[#E8E4E0]" />
                  <Link href="/login" className="text-[#4A4035] hover:text-[#7A8B6E] py-2 transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="text-[#7A8B6E] font-semibold py-2">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
