'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Settings, 
  ArrowLeft, 
  Save,
  Shield,
  Database,
  Mail,
  Bell,
  Globe,
  Users,
  Key
} from 'lucide-react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    site_name: 'Freezy Platform',
    site_description: 'Free resources for learners worldwide',
    contact_email: 'admin@freezy.pk',
    
    // User Management
    auto_approve_users: false,
    require_email_verification: true,
    max_users_per_plan: {
      free: 1000,
      pro: 5000,
      enterprise: 10000
    },
    
    // Content Settings
    resources_per_page: 20,
    enable_user_submissions: false,
    moderate_submissions: true,
    
    // Notification Settings
    email_notifications: true,
    admin_notifications: true,
    user_welcome_email: true,
    approval_notifications: true,
    
    // Security Settings
    session_timeout: 24, // hours
    max_login_attempts: 5,
    require_strong_passwords: true,
    
    // API Settings
    rate_limit_per_hour: 1000,
    enable_api_access: false,
    
    // Maintenance
    maintenance_mode: false,
    maintenance_message: 'We are currently performing maintenance. Please check back soon.'
  })

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin) {
      loadSettings()
    }
  }, [isAdmin])

  const loadSettings = async () => {
    try {
      // TODO: Load settings from Firebase
      console.log('Loading system settings...')
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Save settings to Firebase
      console.log('Saving settings:', settings)
      
      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && !Array.isArray(prev[section])
        ? { ...prev[section], [key]: value }
        : value
    }))
  }

  const handleSimpleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600">Configure platform settings and preferences</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => handleSimpleChange('site_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => handleSimpleChange('contact_email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.site_description}
                  onChange={(e) => handleSimpleChange('site_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Auto-approve new users</h3>
                  <p className="text-sm text-gray-500">Automatically approve user registrations without manual review</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_approve_users}
                    onChange={(e) => handleSimpleChange('auto_approve_users', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Require email verification</h3>
                  <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.require_email_verification}
                    onChange={(e) => handleSimpleChange('require_email_verification', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resources per page
                </label>
                <input
                  type="number"
                  value={settings.resources_per_page}
                  onChange={(e) => handleSimpleChange('resources_per_page', parseInt(e.target.value))}
                  min="10"
                  max="100"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session timeout (hours)
                </label>
                <input
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => handleSimpleChange('session_timeout', parseInt(e.target.value))}
                  min="1"
                  max="168"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max login attempts
                </label>
                <input
                  type="number"
                  value={settings.max_login_attempts}
                  onChange={(e) => handleSimpleChange('max_login_attempts', parseInt(e.target.value))}
                  min="3"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Require strong passwords</h3>
                    <p className="text-sm text-gray-500">Enforce minimum password requirements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.require_strong_passwords}
                      onChange={(e) => handleSimpleChange('require_strong_passwords', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Maintenance</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Maintenance mode</h3>
                  <p className="text-sm text-gray-500">Put the site in maintenance mode for updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => handleSimpleChange('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance message
                </label>
                <textarea
                  value={settings.maintenance_message}
                  onChange={(e) => handleSimpleChange('maintenance_message', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Message to show users during maintenance"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
