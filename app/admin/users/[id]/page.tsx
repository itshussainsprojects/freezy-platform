'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Star,
  Shield,
  User,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { getUserById, approveUser, rejectUser, deleteUserAdmin } from '../../../../firebase/services/adminService'
import { formatDate } from '../../../utils/dateUtils'

export default function ViewUserPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [userData, setUserData] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin && params.id) {
      loadUser()
    }
  }, [isAdmin, params.id])

  const loadUser = async () => {
    try {
      setLoadingUser(true)
      const result = await getUserById(params.id)
      if (result.success) {
        setUserData(result.data)
      } else {
        alert('User not found')
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('Error loading user:', error)
      alert('Error loading user')
    } finally {
      setLoadingUser(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this user?')) return

    setProcessing(true)
    try {
      const result = await approveUser(params.id, user.uid)
      if (result.success) {
        alert('User approved successfully!')
        loadUser() // Reload user data
      } else {
        alert('Error approving user: ' + result.error)
      }
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Error approving user')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    setProcessing(true)
    try {
      const result = await rejectUser(params.id, user.uid, reason)
      if (result.success) {
        alert('User rejected successfully!')
        loadUser() // Reload user data
      } else {
        alert('Error rejecting user: ' + result.error)
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Error rejecting user')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setProcessing(true)
    try {
      const result = await deleteUserAdmin(params.id, user.uid)
      if (result.success) {
        alert('User deleted successfully!')
        router.push('/admin/users')
      } else {
        alert('Error deleting user: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4 mr-1" />
            Unknown
          </span>
        )
    }
  }

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'enterprise':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Enterprise</span>
      case 'pro':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Pro</span>
      case 'free':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Free</span>
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Unknown</span>
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <Link
            href="/admin/users"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
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
            href="/admin/users"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{userData.profile?.name || 'Unknown User'}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  {getStatusBadge(userData.subscription?.approval_status)}
                  <span className="text-gray-500">•</span>
                  {getPlanBadge(userData.subscription?.selected_plan)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {userData.subscription?.approval_status === 'pending' && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </>
              )}
              <Link
                href={`/admin/users/${userData.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-gray-900">{userData.profile?.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{userData.profile?.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900">{userData.profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                  <p className="text-gray-900">{userData.profile?.location || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Selected Plan</label>
                  <p className="text-gray-900 capitalize">{userData.subscription?.selected_plan || 'Not selected'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Approval Status</label>
                  <p className="text-gray-900 capitalize">{userData.subscription?.approval_status || 'Unknown'}</p>
                </div>
                {userData.subscription?.approved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Approved At</label>
                    <p className="text-gray-900">{formatDate(userData.subscription.approved_at, 'Not approved')}</p>
                  </div>
                )}
                {userData.subscription?.approved_by && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Approved By</label>
                    <p className="text-gray-900">{userData.subscription.approved_by}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{userData.activity?.saved_resources?.length || 0}</p>
                  <p className="text-sm text-gray-600">Saved Resources</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{userData.activity?.viewed_resources?.length || 0}</p>
                  <p className="text-sm text-gray-600">Viewed Resources</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{userData.activity?.application_history?.length || 0}</p>
                  <p className="text-sm text-gray-600">Applications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Joined</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(userData.profile?.created_at, 'Unknown')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Login</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(userData.profile?.last_login, 'Never')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Verified</p>
                    <p className="text-sm text-gray-600">
                      {userData.profile?.email_verified ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Shield className="w-4 h-4 mr-2" />
                  View Audit Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
