'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  ArrowLeft, 
  Save,
  Briefcase,
  BookOpen,
  Wrench,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { createResource } from '../../../../firebase/services/adminService'

export default function AddResourcePage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'job',
    description: '',
    location: '',
    duration: '',
    company: '',
    source_url: '',
    requirements: '',
    benefits: '',
    status: 'active'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Create resource in Firebase
      const result = await createResource(formData, user.uid)

      if (result.success) {
        alert('Resource created successfully!')
        router.push('/admin/resources')
      } else {
        alert('Error creating resource: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating resource:', error)
      alert('Error creating resource. Please try again.')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/resources"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Save className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Resource</h1>
              <p className="text-gray-600">Create a new job, course, or tool</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Frontend Developer, React Course, Figma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="job">Job</option>
                  <option value="course">Course</option>
                  <option value="tool">Tool</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of the resource..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Karachi, Pakistan or Online"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Full-time, 40 hours, Free"
                />
              </div>

              {formData.type === 'job' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Company name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source URL
                </label>
                <input
                  type="url"
                  name="source_url"
                  value={formData.source_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter requirements separated by commas (e.g., React, JavaScript, CSS)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple requirements with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter benefits separated by commas (e.g., Health Insurance, Remote Work, Learning Budget)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple benefits with commas</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview</h2>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    formData.type === 'job' ? 'bg-blue-100' :
                    formData.type === 'course' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {formData.type === 'job' ? <Briefcase className="w-5 h-5 text-blue-600" /> :
                     formData.type === 'course' ? <BookOpen className="w-5 h-5 text-green-600" /> :
                     <Wrench className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formData.title || 'Resource Title'}
                    </h3>
                    {formData.company && (
                      <p className="text-gray-600">{formData.company}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                {formData.description || 'Resource description will appear here...'}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {formData.location && (
                  <span>📍 {formData.location}</span>
                )}
                {formData.duration && (
                  <span>⏱️ {formData.duration}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/resources"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.title || !formData.description}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Resource
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
