'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'
import { 
  Heart, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Briefcase, 
  BookOpen, 
  Wrench,
  Eye
} from 'lucide-react'
import { saveResource, removeSavedResource, addToViewHistory } from '../../firebase/services/userActivityService'
import { parseResourceArray } from '../utils/resourceUtils'

interface ResourceCardProps {
  resource: {
    id: string
    title: string
    type: 'job' | 'course' | 'tool'
    description: string
    location?: string
    duration?: string
    source_url?: string
    company?: string
    requirements?: string | string[]
    benefits?: string | string[]
  }
  isSaved?: boolean
  onSaveToggle?: (resourceId: string, isSaved: boolean) => void
}

export default function ResourceCard({ resource, isSaved = false, onSaveToggle }: ResourceCardProps) {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning } = useToast()
  const [saved, setSaved] = useState(isSaved)
  const [loading, setLoading] = useState(false)

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

  const handleSaveToggle = async () => {
    if (!user) {
      showWarning('Please login to save resources')
      return
    }

    setLoading(true)
    try {
      if (saved) {
        const result = await removeSavedResource(user.uid, resource.id)
        if (result.success) {
          setSaved(false)
          onSaveToggle?.(resource.id, false)
          showSuccess('Resource removed from saved')
        } else {
          showError(result.error || 'Failed to remove resource')
        }
      } else {
        const result = await saveResource(user.uid, resource)
        if (result.success) {
          setSaved(true)
          onSaveToggle?.(resource.id, true)
          showSuccess('Resource saved successfully!')
        } else {
          if (result.alreadySaved) {
            showWarning('You have already saved this resource!')
            setSaved(true) // Update UI to show it's saved
            onSaveToggle?.(resource.id, true)
          } else {
            showError(result.error || 'Failed to save resource')
          }
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      showError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleView = async () => {
    if (user) {
      // Track view in history
      await addToViewHistory(user.uid, resource)
    }
    
    // Open resource
    if (resource.source_url) {
      window.open(resource.source_url, '_blank')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
            {getTypeIcon(resource.type)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
            {resource.company && (
              <p className="text-gray-600">{resource.company}</p>
            )}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleSaveToggle}
          disabled={loading}
          className={`p-2 rounded-lg transition-colors ${
            saved 
              ? 'text-red-600 hover:text-red-700 bg-red-50' 
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
          }`}
          title={saved ? 'Remove from saved' : 'Save resource'}
        >
          <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">{resource.description}</p>
      
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
        {resource.location && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {resource.location}
          </div>
        )}
        {resource.duration && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {resource.duration}
          </div>
        )}
      </div>
      
      {resource.requirements && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const requirementsArray = parseResourceArray(resource.requirements);
              const displayRequirements = requirementsArray.slice(0, 3);
              const hasMore = requirementsArray.length > 3;

              return (
                <>
                  {displayRequirements.map((req, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {req}
                    </span>
                  ))}
                  {hasMore && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      +{requirementsArray.length - 3} more
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
      
      {resource.benefits && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const benefitsArray = parseResourceArray(resource.benefits);
              const displayBenefits = benefitsArray.slice(0, 2);
              const hasMore = benefitsArray.length > 2;

              return (
                <>
                  {displayBenefits.map((benefit, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {benefit}
                    </span>
                  ))}
                  {hasMore && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      +{benefitsArray.length - 2} more
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Click to view and track</span>
        </div>
        
        <button
          onClick={handleView}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Resource
        </button>
      </div>
    </div>
  )
}
