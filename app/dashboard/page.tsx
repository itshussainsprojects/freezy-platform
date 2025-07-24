'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  BookOpen, 
  Briefcase, 
  Wrench, 
  Heart, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Calendar,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '../utils/dateUtils'
import { getUserActivityStats } from '../../firebase/services/userActivityService'
// import ApprovalGuard from '../components/ApprovalGuard'

export default function DashboardPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    savedResources: 0,
    viewedResources: 0,
    applications: 0,
    totalResources: 156
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Check if user is approved
  const isApproved = userData?.subscription?.approval_status === 'approved'
  const isPending = userData?.subscription?.approval_status === 'pending'
  const isRejected = userData?.subscription?.approval_status === 'rejected'

  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        try {
          const statsResult = await getUserActivityStats(user.uid)
          if (statsResult.success) {
            setStats(statsResult.data)
          }
        } catch (error) {
          console.error('Error loading stats:', error)
          // Fallback to userData if available
          if (userData) {
            setStats({
              savedResources: userData.activity?.saved_resources?.length || 0,
              viewedResources: userData.activity?.viewed_resources?.length || 0,
              applications: userData.activity?.application_history?.length || 0,
              totalResources: 156
            })
          }
        }
      }
    }

    loadStats()
  }, [user, userData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'pro': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'free': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If not logged in, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to access this page.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  // If rejected, show rejection message
  if (isRejected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Rejected</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your application has been rejected. Please contact support for more information.
          </p>
          <div className="space-y-3">
            <Link
              href="mailto:admin@freezy.pk"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
            <div>
              <Link
                href="/auth/logout"
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If pending, show pending approval message
  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Approval Pending</h2>
          <p className="text-gray-600 mb-6">
            Your account is currently under review. You'll receive an email notification once your account has been approved.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">What happens next?</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Our admin team will review your application</li>
                  <li>• You'll receive an email notification with the decision</li>
                  <li>• This usually takes 24-48 hours</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-500">
              <p>Applied: {userData?.profile?.created_at ? formatDate(userData.profile.created_at, 'Recently') : 'Recently'}</p>
              <p>Plan: {userData?.subscription?.selected_plan || 'Free'}</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/auth/logout"
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If approved, show the dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userData?.profile?.name || user.displayName || 'User'}! 👋
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your Freezy account today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(userData?.subscription?.approval_status || 'pending')}`}>
                {userData?.subscription?.approval_status === 'approved' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                {userData?.subscription?.approval_status === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
                {userData?.subscription?.approval_status === 'rejected' && <AlertCircle className="w-4 h-4 inline mr-1" />}
                {userData?.subscription?.approval_status || 'Pending'}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPlanColor(userData?.subscription?.selected_plan || 'free')}`}>
                <Star className="w-4 h-4 inline mr-1" />
                {userData?.subscription?.selected_plan || 'Free'} Plan
              </div>
            </div>
          </div>
        </div>

        {/* Account Status Alert */}
        {userData?.subscription?.approval_status === 'pending' && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <Clock className="w-6 h-6 text-yellow-600 mt-1 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Account Pending Approval</h3>
                <p className="text-yellow-700 mb-4">
                  Your {userData?.subscription?.selected_plan} plan is awaiting admin approval.
                  You currently have access to free resources while we review your application.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-yellow-600">Applied: {formatDate(userData?.profile?.created_at, 'Recently')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Resources</p>
                <p className="text-3xl font-bold text-gray-900">{stats.savedResources}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/saved" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View saved → 
              </Link>
            </div>
          </div>

          {/* More Stats Components */}
          {/* Add additional stats components here, similar to the Saved Resources block */}

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Browse Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Resources</h3>
            <div className="space-y-3">
              <Link
                href="/resources?type=job"
                className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mr-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Job Opportunities</p>
                  <p className="text-sm text-gray-600">Find your next career move</p>
                </div>
              </Link>
              {/* Add other resources links here */}
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>
            <div className="space-y-3">
              <Link
                href="/settings"
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Account Settings</p>
                  <p className="text-sm text-gray-600">Manage your profile and preferences</p>
                </div>
              </Link>
              {/* Add other account management links here */}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No recent activity yet</p>
            <Link
              href="/resources"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Exploring
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
