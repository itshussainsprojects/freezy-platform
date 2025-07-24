'use client'

import { useState } from 'react'
import { addResourceManually } from '../../../firebase/services/freeResourceService'

export default function AddResource() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'job',
    category: '',
    location: '',
    duration: '',
    sourceUrl: '',
    accessLevel: 'free',
    requirements: '',
    benefits: '',
    isFeatured: false
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const resourceData = {
        ...formData,
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(r => r),
        benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b)
      }
      
      const result = await addResourceManually(resourceData)
      
      if (result.success) {
        setMessage('Resource added successfully!')
        setFormData({
          title: '',
          description: '',
          type: 'job',
          category: '',
          location: '',
          duration: '',
          sourceUrl: '',
          accessLevel: 'free',
          requirements: '',
          benefits: '',
          isFeatured: false
        })
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Add New Resource
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Frontend Developer at TechCorp"
            />
          </div>
          
          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed description of the resource..."
            />
          </div>
          
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="job">Job</option>
              <option value="internship">Internship</option>
              <option value="course">Course</option>
              <option value="tool">Tool</option>
            </select>
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., software-development, marketing"
            />
          </div>
          
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Karachi, Pakistan or Online"
            />
          </div>
          
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Full-time, 6 weeks, Self-paced"
            />
          </div>
          
          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source URL
            </label>
            <input
              type="url"
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/job-posting"
            />
          </div>
          
          {/* Access Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Level *
            </label>
            <select
              name="accessLevel"
              value={formData.accessLevel}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="demo">Demo (Everyone)</option>
              <option value="free">Free (Approved Users)</option>
              <option value="pro">Pro (Pro Plan)</option>
              <option value="enterprise">Enterprise (Enterprise Plan)</option>
            </select>
          </div>
          
          {/* Requirements */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements (comma-separated)
            </label>
            <input
              type="text"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="React, JavaScript, CSS, 2+ years experience"
            />
          </div>
          
          {/* Benefits */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits (comma-separated)
            </label>
            <input
              type="text"
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Health Insurance, Remote Work, Learning Budget"
            />
          </div>
          
          {/* Featured */}
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mark as Featured</span>
            </label>
          </div>
        </div>
        
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            {message}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Adding Resource...
            </div>
          ) : (
            'Add Resource'
          )}
        </button>
      </form>
    </div>
  )
}
