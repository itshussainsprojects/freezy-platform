'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Clock, 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { getUsersByStatus, approveUser, rejectUser } from '../../../firebase/services/adminService'
import { formatDate } from '../../utils/dateUtils'

export default function AdminApprovalsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [processingUsers, setProcessingUsers] = useState(new Set())

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin) {
      loadPendingUsers()
    }
  }, [isAdmin])

  const loadPendingUsers = async () => {
    try {
      setLoadingUsers(true)
      const result = await getUsersByStatus('pending', null, 50)
      if (result.success) {
        setPendingUsers(result.data)
      }
    } catch (error) {
      console.error('Error loading pending users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleApproveUser = async (userId) => {
    setProcessingUsers(prev => new Set(prev).add(userId))
    try {
      const result = await approveUser(userId, user.uid)
      if (result.success) {
        await loadPendingUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error approving user:', error)
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleRejectUser = async (userId) => {
    const reason = prompt('Reason for rejection (optional):')
    if (reason === null) return // User cancelled

    setProcessingUsers(prev => new Set(prev).add(userId))
    try {
      const result = await rejectUser(userId, user.uid, reason || '')
      if (result.success) {
        await loadPendingUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleBulkApprove = async () => {
    if (!confirm(`Are you sure you want to approve all ${pendingUsers.length} pending users?`)) {
      return
    }

    for (const userData of pendingUsers) {
      try {
        await approveUser(userData.id, user.uid)
      } catch (error) {
        console.error(`Error approving user ${userData.id}:`, error)
      }
    }
    
    await loadPendingUsers()
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
                <p className="text-gray-600">Review and approve user registrations</p>
              </div>
            </div>

            {pendingUsers.length > 0 && (
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve All ({pendingUsers.length})
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Newest Registration</p>
                <p className="text-sm font-bold text-gray-900">
                  {pendingUsers.length > 0 ? formatDate(pendingUsers[0]?.profile?.created_at, 'None') : 'None'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Requires Action</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loadingUsers ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading pending approvals...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending user approvals at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingUsers.map((userData) => (
                <div key={userData.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {userData.profile?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {userData.profile?.email || 'No email'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Registered {formatDate(userData.profile?.created_at, 'Unknown')}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {userData.subscription?.selected_plan || 'free'} plan
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleRejectUser(userData.id)}
                        disabled={processingUsers.has(userData.id)}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingUsers.has(userData.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2 inline" />
                            Reject
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleApproveUser(userData.id)}
                        disabled={processingUsers.has(userData.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingUsers.has(userData.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 inline" />
                            Approve
                          </>
                        )}
                      </button>
                      <Link
                        href={`/admin/users/${userData.id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
