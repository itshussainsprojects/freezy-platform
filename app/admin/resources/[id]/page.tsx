'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  ArrowLeft, 
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  Building,
  Clock,
  Tag,
  Eye,
  Heart,
  Share2
} from 'lucide-react'
import Link from 'next/link'
import { getResourceById, deleteResource } from '../../../../firebase/services/adminService'

export default function ViewResourcePage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [resource, setResource] = useState(null)
  const [loadingResource, setLoadingResource] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin && params.id) {
      loadResource()
    }
  }, [isAdmin, params.id])

  const loadResource = async () => {
    try {
      setLoadingResource(true)
      const result = await getResourceById(params.id)
      if (result.success) {
        setResource(result.data)
      } else {
        alert('Resource not found')
        router.push('/admin/resources')
      }
    } catch (error) {
      console.error('Error loading resource:', error)
      alert('Error loading resource')
    } finally {
      setLoadingResource(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const result = await deleteResource(params.id, user.uid)
      if (result.success) {
        alert('Resource deleted successfully')
        router.push('/admin/resources')
      } else {
        alert('Error deleting resource: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Error deleting resource')
    } finally {
      setDeleting(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'job': return '💼'
      case 'course': return '📚'
      case 'tool': return '🔧'
      default: return '📦'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Active</span>
      case 'inactive':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Inactive</span>
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pending</span>
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

  if (loadingResource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resource...</p>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resource Not Found</h2>
          <Link
            href="/admin/resources"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
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
            href="/admin/resources"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getTypeIcon(resource.type)}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{resource.title}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  {getStatusBadge(resource.status)}
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 capitalize">{resource.type}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/resources/${resource.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Resource Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{resource.description}</p>
            </div>

            {/* Requirements */}
            {resource.requirements && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Handle both string and array formats
                    let requirementsArray = [];
                    if (typeof resource.requirements === 'string') {
                      requirementsArray = resource.requirements
                        .split(/[,;|]/)
                        .map(req => req.trim())
                        .filter(req => req.length > 0);
                    } else if (Array.isArray(resource.requirements)) {
                      requirementsArray = resource.requirements;
                    }

                    return requirementsArray.map((req, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {req}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Benefits */}
            {resource.benefits && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Handle both string and array formats
                    let benefitsArray = [];
                    if (typeof resource.benefits === 'string') {
                      benefitsArray = resource.benefits
                        .split(/[,;|]/)
                        .map(benefit => benefit.trim())
                        .filter(benefit => benefit.length > 0);
                    } else if (Array.isArray(resource.benefits)) {
                      benefitsArray = resource.benefits;
                    }

                    return benefitsArray.map((benefit, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {benefit}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resource Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Information</h2>
              <div className="space-y-4">
                {resource.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{resource.location}</span>
                  </div>
                )}

                {resource.company && (
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{resource.company}</span>
                  </div>
                )}

                {resource.duration && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{resource.duration}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    Created {new Date(resource.created_at?.toDate ? resource.created_at.toDate() : resource.created_at).toLocaleDateString()}
                  </span>
                </div>

                {resource.source_url && (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={resource.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Original
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview as User
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
