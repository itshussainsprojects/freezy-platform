'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  BookOpen, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Database,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { getUsersByStatus, getAdminStats, getAllUsers } from '../../firebase/services/adminService'
import { DataStats, InitializeData } from '../components/admin/InitializeData'

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalResources: 0,
    activeResources: 0
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  const loadAdminData = async () => {
    try {
      setLoadingData(true)
      
      // Get pending users
      const pendingResult = await getUsersByStatus('pending', null, 10)
      if (pendingResult.success) {
        setPendingUsers(pendingResult.data)
        setStats(prev => ({
          ...prev,
          pendingApprovals: pendingResult.data.length
        }))
      }

      // Get real admin statistics
      const statsResult = await getAdminStats()
      if (statsResult.success) {
        setStats(prev => ({
          ...prev,
          totalUsers: statsResult.data.users.total,
          totalResources: statsResult.data.resources.total,
          activeResources: statsResult.data.resources.active
        }))
      } else {
        // Fallback to default stats if error
        setStats(prev => ({
          ...prev,
          totalUsers: 0,
          totalResources: 0,
          activeResources: 0
        }))
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage users, resources, and platform settings</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Manage users →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/approvals" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                Review pending →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalResources}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/resources" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Manage resources →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Resources</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeResources}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                {((stats.activeResources / stats.totalResources) * 100).toFixed(1)}% active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">All Users</p>
                  <p className="text-sm text-gray-600">View and manage all users</p>
                </div>
              </Link>

              <Link
                href="/admin/approvals"
                className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Pending Approvals</p>
                  <p className="text-sm text-gray-600">{stats.pendingApprovals} users waiting for approval</p>
                </div>
                {stats.pendingApprovals > 0 && (
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {stats.pendingApprovals}
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* Resource Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Management</h3>
            <div className="space-y-3">
              <Link
                href="/admin/resources/add"
                className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mr-4">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add New Resource</p>
                  <p className="text-sm text-gray-600">Manually add jobs, courses, or tools</p>
                </div>
              </Link>

              <Link
                href="/admin/resources"
                className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Resources</p>
                  <p className="text-sm text-gray-600">Edit, delete, and moderate content</p>
                </div>
              </Link>

              <Link
                href="/admin/initialize"
                className="flex items-center p-4 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mr-4">
                  <Database className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Initialize Sample Data</p>
                  <p className="text-sm text-gray-600">Add sample resources to get started</p>
                </div>
              </Link>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
            <div className="space-y-3">
              <Link
                href="/admin/settings"
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">System Settings</p>
                  <p className="text-sm text-gray-600">Configure platform settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Pending Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Pending Users</h3>
              <Link
                href="/admin/approvals"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all →
              </Link>
            </div>
            
            {pendingUsers.length > 0 ? (
              <div className="space-y-3">
                {pendingUsers.slice(0, 5).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.profile?.name}</p>
                      <p className="text-sm text-gray-600">{user.profile?.email}</p>
                      <p className="text-xs text-gray-500">
                        {user.subscription?.selected_plan} plan • {new Date(user.profile?.created_at?.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending approvals</p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Database</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Operational</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Authentication</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Operational</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Storage</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Operational</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Auto-Scraping</span>
                </div>
                <span className="text-sm text-yellow-600 font-medium">Manual Mode</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link
                href="/admin/settings"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
