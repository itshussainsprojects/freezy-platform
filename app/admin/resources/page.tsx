'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Package, 
  ArrowLeft, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Briefcase,
  BookOpen,
  Wrench
} from 'lucide-react'
import Link from 'next/link'
import { deleteResource, getResources } from '../../../firebase/services/adminService'

export default function AdminResourcesPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [resources, setResources] = useState([])
  const [filteredResources, setFilteredResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Resources will be loaded from Firebase

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (isAdmin) {
      loadResources()
    }
  }, [isAdmin])

  const loadResources = async () => {
    try {
      setLoadingResources(true)
      // Get all resources from Firebase
      const result = await getResources()
      if (result.success) {
        setResources(result.data)
        setFilteredResources(result.data)
      } else {
        console.error('Error loading resources:', result.error)
        setResources([])
        setFilteredResources([])
      }
    } catch (error) {
      console.error('Error loading resources:', error)
      setResources([])
      setFilteredResources([])
    } finally {
      setLoadingResources(false)
    }
  }

  // Filter resources
  useEffect(() => {
    let filtered = resources

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(resource => resource.type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(resource => resource.status === statusFilter)
    }

    setFilteredResources(filtered)
  }, [resources, searchTerm, typeFilter, statusFilter])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'job': return <Briefcase className="w-4 h-4" />
      case 'course': return <BookOpen className="w-4 h-4" />
      case 'tool': return <Wrench className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'job':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Job</span>
      case 'course':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Course</span>
      case 'tool':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Tool</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return
    }

    try {
      const result = await deleteResource(resourceId, user.uid)
      if (result.success) {
        alert('Resource deleted successfully!')
        loadResources() // Reload the resources list
      } else {
        alert('Error deleting resource: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Error deleting resource')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
      case 'inactive':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Inactive</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
                <p className="text-gray-600">Manage jobs, courses, and tools</p>
              </div>
            </div>

            <Link
              href="/admin/resources/add"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.filter(r => r.type === 'job').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.filter(r => r.type === 'course').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tools</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.filter(r => r.type === 'tool').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="job">Jobs</option>
              <option value="course">Courses</option>
              <option value="tool">Tools</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <div className="flex items-center text-gray-600">
              <span className="text-sm">
                {filteredResources.length} of {resources.length} resources
              </span>
            </div>
          </div>
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingResources ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No resources found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            {getTypeIcon(resource.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {resource.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {resource.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(resource.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(resource.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/resources/${resource.id}`}
                            className="text-blue-600 hover:text-blue-700"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/resources/${resource.id}/edit`}
                            className="text-green-600 hover:text-green-700"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
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
