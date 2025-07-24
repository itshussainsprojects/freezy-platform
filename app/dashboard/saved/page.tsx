'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Heart, ArrowLeft, ExternalLink, MapPin, Clock, Briefcase, BookOpen, Wrench } from 'lucide-react'
import Link from 'next/link'
import { getSavedResources, removeSavedResource } from '../../../firebase/services/userActivityService'

export default function SavedResourcesPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [savedResources, setSavedResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(true)

  const handleRemoveResource = async (resourceId) => {
    if (user) {
      try {
        const result = await removeSavedResource(user.uid, resourceId)
        if (result.success) {
          setSavedResources(prev => prev.filter(r => r.id !== resourceId))
        }
      } catch (error) {
        console.error('Error removing resource:', error)
      }
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadSavedResources = async () => {
      if (user) {
        try {
          const result = await getSavedResources(user.uid)
          if (result.success) {
            // Remove duplicates based on ID and ensure unique keys
            const uniqueResources = result.data.filter((resource, index, self) =>
              index === self.findIndex(r => r.id === resource.id)
            )
            setSavedResources(uniqueResources)
          } else {
            console.error('Error loading saved resources:', result.error)
            setSavedResources([])
          }
        } catch (error) {
          console.error('Error loading saved resources:', error)
          setSavedResources([])
        } finally {
          setLoadingResources(false)
        }
      }
    }

    loadSavedResources()
  }, [user])

  if (loading || loadingResources) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved resources...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase className="w-5 h-5" />
      case 'course': return <BookOpen className="w-5 h-5" />
      case 'tool': return <Wrench className="w-5 h-5" />
      default: return <Heart className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-100 text-blue-800'
      case 'course': return 'bg-green-100 text-green-800'
      case 'tool': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
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
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Resources</h1>
              <p className="text-gray-600">Resources you've saved for later</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{savedResources.filter(r => r.type === 'job').length}</p>
              <p className="text-gray-600">Jobs Saved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{savedResources.filter(r => r.type === 'course').length}</p>
              <p className="text-gray-600">Courses Saved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{savedResources.filter(r => r.type === 'tool').length}</p>
              <p className="text-gray-600">Tools Saved</p>
            </div>
          </div>
        </div>

        {/* Saved Resources List */}
        <div className="space-y-6">
          {savedResources.length > 0 ? (
            savedResources.map((resource, index) => (
              <div key={`${resource.id}-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                        {getTypeIcon(resource.type)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {resource.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {resource.duration}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Saved on {new Date(resource.saved_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleRemoveResource(resource.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Remove from saved"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                        <a
                          href={resource.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Resource
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Resources</h3>
              <p className="text-gray-600 mb-6">You haven't saved any resources yet. Start exploring to save your favorites!</p>
              <Link
                href="/resources"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Resources
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
