'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { 
  Settings, 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Smartphone,
  Mail,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { updateDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebase.config'

export default function SettingsPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPhone, setShowPhone] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    notifications: {
      email_notifications: true,
      push_notifications: true,
      job_alerts: true,
      course_updates: true,
      tool_recommendations: true
    },
    preferences: {
      preferred_categories: [],
      location_preferences: []
    }
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.profile?.name || '',
        email: userData.profile?.email || '',
        phoneNumber: userData.profile?.phone_number || '',
        notifications: userData.preferences?.notification_settings || {
          email_notifications: true,
          push_notifications: true,
          job_alerts: true,
          course_updates: true,
          tool_recommendations: true
        },
        preferences: {
          preferred_categories: userData.preferences?.preferred_categories || [],
          location_preferences: userData.preferences?.location_preferences || []
        }
      })
    }
  }, [userData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('notifications.')) {
      const notificationKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationKey]: checked
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      if (!user) {
        setMessage('Error: User not authenticated')
        return
      }

      // Validate phone number
      if (formData.phoneNumber && !formData.phoneNumber.match(/^\+92[0-9]{10}$/)) {
        setMessage('Error: Phone number must be in format +92XXXXXXXXXX')
        return
      }

      // Update user document in Firestore (create if doesn't exist)
      const userDocRef = doc(db, 'users', user.uid)

      try {
        await updateDoc(userDocRef, {
          'profile.name': formData.name,
          'profile.phone_number': formData.phoneNumber,
          'preferences.notification_settings': formData.notifications,
          'preferences.preferred_categories': formData.preferences.preferred_categories,
          'preferences.location_preferences': formData.preferences.location_preferences
        })
      } catch (error) {
        if (error.message.includes('No document to update')) {
          // Document doesn't exist, create it
          const userData = {
            profile: {
              name: formData.name,
              email: user.email,
              phone_number: formData.phoneNumber,
              created_at: new Date(),
              last_login: new Date(),
              email_verified: user.emailVerified
            },
            subscription: {
              selected_plan: 'free',
              approval_status: 'approved',
              approved_by: 'system',
              approved_at: new Date(),
              plan_expires_at: null
            },
            preferences: {
              notification_settings: formData.notifications,
              preferred_categories: formData.preferences.preferred_categories,
              location_preferences: formData.preferences.location_preferences
            },
            activity: {
              saved_resources: [],
              viewed_resources: [],
              application_history: []
            }
          }

          await setDoc(userDocRef, userData)
        } else {
          throw error
        }
      }

      setMessage('Settings saved successfully!')

      // Refresh user data in context
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600">Manage your profile and preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type={showPhone ? 'text' : 'password'}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+92XXXXXXXXXX"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhone(!showPhone)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Account Status</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Subscription Plan</p>
                <p className="text-lg font-semibold text-blue-600">
                  {userData?.subscription?.selected_plan?.charAt(0).toUpperCase() + userData?.subscription?.selected_plan?.slice(1) || 'Free'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Approval Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  userData?.subscription?.approval_status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : userData?.subscription?.approval_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {userData?.subscription?.approval_status || 'Pending'}
                </span>
              </div>
            </div>
            
            {userData?.subscription?.approval_status !== 'approved' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Your account is pending approval. You currently have access to free resources.
                </p>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="notifications.email_notifications"
                  checked={formData.notifications.email_notifications}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive browser notifications</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="notifications.push_notifications"
                  checked={formData.notifications.push_notifications}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Job Alerts</p>
                  <p className="text-sm text-gray-500">Get notified about new job opportunities</p>
                </div>
                <input
                  type="checkbox"
                  name="notifications.job_alerts"
                  checked={formData.notifications.job_alerts}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Course Updates</p>
                  <p className="text-sm text-gray-500">Get notified about new courses</p>
                </div>
                <input
                  type="checkbox"
                  name="notifications.course_updates"
                  checked={formData.notifications.course_updates}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Tool Recommendations</p>
                  <p className="text-sm text-gray-500">Get notified about useful tools</p>
                </div>
                <input
                  type="checkbox"
                  name="notifications.tool_recommendations"
                  checked={formData.notifications.tool_recommendations}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {message && (
              <div className={`px-4 py-2 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                {message}
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={`ml-auto inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
