'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DataStats } from '../../components/admin/InitializeData'
import InitializeData from '../../components/admin/InitializeData'

export default function AdminInitializePage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Initialize Sample Data</h1>
              <p className="text-gray-600">Set up your Freezy platform with sample resources</p>
            </div>
          </div>
        </div>

        {/* Current Stats */}
        <DataStats />

        {/* Initialize Component */}
        <InitializeData />

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens after initialization?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Sample resources will be visible to all users based on their access levels</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Users can search, filter, and interact with the sample data</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>You can add more resources manually through the admin panel</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Analytics will start tracking user interactions with resources</span>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/resources/add"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mr-4">
                <span className="text-green-600 font-bold">+</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Add More Resources</p>
                <p className="text-sm text-gray-600">Manually add jobs, courses, and tools</p>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">👥</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">Approve users and manage accounts</p>
              </div>
            </Link>

            <Link
              href="/resources"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mr-4">
                <span className="text-purple-600 font-bold">🔍</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Test Resources</p>
                <p className="text-sm text-gray-600">Browse and test the sample data</p>
              </div>
            </Link>

            <Link
              href="/admin"
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                <span className="text-gray-600 font-bold">📊</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Monitor platform usage and stats</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
