'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Users, 
  Shield, 
  ArrowLeft, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { getUsersByStatus, approveUser, rejectUser, updateUserPlanAdmin, getAllUsers, bulkApproveUsers, deleteUserAdmin } from '../../../firebase/services/adminService'
import { formatDate } from '../../utils/dateUtils'

export default function AdminUsersPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState(new Set())

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      // Get all users from Firebase
      const result = await getAllUsers()
      if (result.success) {
        setUsers(result.data)
        setFilteredUsers(result.data)
      } else {
        console.error('Error loading users:', result.error)
        setUsers([])
        setFilteredUsers([])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
      setFilteredUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription?.approval_status === statusFilter)
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription?.selected_plan === planFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, statusFilter, planFilter])

  const handleApproveUser = async (userId) => {
    try {
      const result = await approveUser(userId, user.uid)
      if (result.success) {
        await loadUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  const handleRejectUser = async (userId) => {
    const reason = prompt('Reason for rejection (optional):')
    try {
      const result = await rejectUser(userId, user.uid, reason || '')
      if (result.success) {
        await loadUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const result = await deleteUserAdmin(userId, user.uid)
      if (result.success) {
        alert('User deleted successfully!')
        await loadUsers() // Refresh the list
      } else {
        alert('Error deleting user: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleUpdatePlan = async (userId, newPlan) => {
    try {
      const result = await updateUserPlanAdmin(userId, newPlan, user.uid)
      if (result.success) {
        await loadUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating plan:', error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>
    }
  }

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'free':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Free</span>
      case 'pro':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Pro</span>
      case 'enterprise':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Enterprise</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>
    }
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
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user accounts, approvals, and plans</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-600">
              <span className="text-sm">
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingUsers ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userData.profile?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData.profile?.email || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(userData.subscription?.approval_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(userData.subscription?.selected_plan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(userData.profile?.created_at, 'Unknown')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {userData.subscription?.approval_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveUser(userData.id)}
                                className="text-green-600 hover:text-green-700"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectUser(userData.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/users/${userData.id}`}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/users/${userData.id}/edit`}
                            className="text-gray-600 hover:text-gray-700"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteUser(userData.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
