"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Search, User, Sparkles, LogOut, Settings, Shield } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { logoutUser } from "../../firebase/auth/authService"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, userData, isAdmin, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled
        ? 'glass-card border-b border-white/20 shadow-2xl'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-freezy-gradient rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 glow-effect">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-3xl font-black text-gradient-animated">Freezy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-lg font-medium relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-freezy-gradient group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/resources" className="text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-lg font-medium relative group">
              Resources
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-freezy-gradient group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/pricing" className="text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-lg font-medium relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-freezy-gradient group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/resources" className="text-white drop-shadow-lg hover:text-cyan-300 transition-all duration-300 p-3 rounded-xl hover:bg-white/10">
              <Search className="w-6 h-6" />
            </Link>

            {/* Authentication Section */}
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-freezy-gradient rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{userData?.profile?.name || user.displayName || 'User'}</p>
                    <p className="text-cyan-300 text-xs">{userData?.subscription?.selected_plan || 'Free'}</p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{userData?.profile?.name || user.displayName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userData?.subscription?.approval_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : userData?.subscription?.approval_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.subscription?.approval_status || 'Pending'}
                        </span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {userData?.subscription?.selected_plan || 'Free'}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center px-3 py-2 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-lg font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="group relative inline-flex items-center bg-white text-gray-900 px-6 py-3 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white drop-shadow-lg hover:text-cyan-300 transition-colors p-2 rounded-xl hover:bg-white/10"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full glass-card border-t border-white/20 backdrop-blur-xl animate-fade-in z-50">
            <div className="px-6 py-8 space-y-6">
              <Link
                href="/"
                className="block text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-xl font-medium py-3 border-b border-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/resources"
                className="block text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-xl font-medium py-3 border-b border-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="/pricing"
                className="block text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-xl font-medium py-3 border-b border-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/resources"
                className="block text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-xl font-medium py-3 border-b border-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse All
              </Link>

              {/* Mobile Authentication Section */}
              {loading ? (
                <div className="w-full h-12 bg-white/20 rounded-xl animate-pulse"></div>
              ) : user ? (
                <div className="space-y-4 pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-10 h-10 bg-freezy-gradient rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{userData?.profile?.name || user.displayName || 'User'}</p>
                      <p className="text-sm text-cyan-300">{userData?.subscription?.selected_plan || 'Free'} Plan</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-lg font-medium py-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="block text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-lg font-medium py-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block text-purple-300 drop-shadow-lg hover:text-purple-200 transition-colors text-lg font-medium py-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left text-red-300 drop-shadow-lg hover:text-red-200 transition-colors text-lg font-medium py-3"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-white/20">
                  <Link
                    href="/auth/login"
                    className="block text-white drop-shadow-lg hover:text-cyan-300 transition-colors text-xl font-medium py-3 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block bg-white text-gray-900 px-6 py-4 rounded-xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="w-5 h-5 inline mr-2" />
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
