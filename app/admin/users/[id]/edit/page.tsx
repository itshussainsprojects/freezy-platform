'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import { 
  ArrowLeft, 
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { getUserById, updateUserAdmin } from '../../../../../firebase/services/adminService'

export default function EditUserPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [saving, setSaving] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    selected_plan: 'free',
    approval_status: 'pending'
  })

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
        const userData = result.data
        setFormData({
          name: userData.profile?.name || '',
          email: userData.profile?.email || '',
          phone: userData.profile?.phone || '',
          location: userData.profile?.location || '',
          selected_plan: userData.subscription?.selected_plan || 'free',
          approval_status: userData.subscription?.approval_status || 'pending'
        })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const result = await updateUserAdmin(params.id, formData, user.uid)
      if (result.success) {
        alert('User updated successfully!')
        router.push(`/admin/users/${params.id}`)
      } else {
        alert('Error updating user: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/users/${params.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
              <p className="text-gray-600">Update user information and settings</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          {/* Subscription Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Plan
                </label>
                <select
                  name="selected_plan"
                  value={formData.selected_plan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="free">Free Plan</option>
                  <option value="pro">Pro Plan</option>
                  <option value="enterprise">Enterprise Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Status
                </label>
                <select
                  name="approval_status"
                  value={formData.approval_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview</h2>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formData.name || 'User Name'}
                  </h3>
                  <p className="text-gray-600">{formData.email || 'user@example.com'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="text-gray-600 ml-2">{formData.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="text-gray-600 ml-2">{formData.location || 'Not provided'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Plan:</span>
                  <span className="text-gray-600 ml-2 capitalize">{formData.selected_plan}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="text-gray-600 ml-2 capitalize">{formData.approval_status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href={`/admin/users/${params.id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.name || !formData.email}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
