'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import ResourceCard from '../components/ResourceCard'
import { getSavedResources } from '../../firebase/services/userActivityService'
import { getResources } from '../../firebase/services/adminService'
import { getResourcesWithPlanLimits, checkPlanLimits } from '../../firebase/services/resourceService'
import { ToastContainer, useToast } from '../components/Toast'
import ShowMorePrompt from '../components/ShowMorePrompt'
import UpgradePrompt from '../components/UpgradePrompt'
import {
  Search,
  Filter,
  Briefcase,
  BookOpen,
  Wrench,
  Loader2
} from 'lucide-react'

function ResourcesContent() {
  const { user, userData } = useAuth()
  const { toasts, removeToast } = useToast()
  const searchParams = useSearchParams()
  const [resources, setResources] = useState([])
  const [planData, setPlanData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [savedResources, setSavedResources] = useState(new Set())
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  useEffect(() => {
    loadResources()

    // Check URL parameters for initial filter
    const typeParam = searchParams.get('type')
    if (typeParam && ['job', 'course', 'tool'].includes(typeParam)) {
      setSelectedType(typeParam)
    }

    // Load user's saved resources to check which ones are already saved
    const loadSavedStatus = async () => {
      if (user) {
        try {
          const result = await getSavedResources(user.uid)
          if (result.success) {
            setSavedResources(new Set(result.data.map(r => r.id)))
          }
        } catch (error) {
          console.error('Error loading saved resources:', error)
        }
      }
    }

    loadSavedStatus()
  }, [user, searchParams])

  const loadResources = async () => {
    try {
      setLoading(true)

      if (!userData) {
        setLoading(false)
        return
      }

      const userPlan = userData.subscription?.selected_plan || 'free'
      const approvalStatus = userData.subscription?.approval_status || 'pending'

      // If user is not approved, show upgrade prompt
      if (approvalStatus !== 'approved' && userPlan !== 'free') {
        setShowUpgradePrompt(true)
        setLoading(false)
        return
      }

      // Get resources with plan limits
      const result = await getResourcesWithPlanLimits(userPlan, {})

      if (result.success) {
        setResources(result.data)
        setPlanData(result.data)
      } else {
        console.error('Error loading resources:', result.error)
        setResources({ jobs: [], courses: [], tools: [], hasMore: {}, limits: {} })
      }
    } catch (error) {
      console.error('Error loading resources:', error)
      setResources({ jobs: [], courses: [], tools: [], hasMore: {}, limits: {} })
    } finally {
      setLoading(false)
    }
  }

  // Get all resources for filtering
  const allResources = resources.jobs ? [
    ...resources.jobs,
    ...resources.courses,
    ...resources.tools
  ] : []

  // Filter resources based on search term and type
  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.company && resource.company.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = selectedType === 'all' || resource.type === selectedType

    return matchesSearch && matchesType
  })

  const getTypeIcon = (type) => {
    switch (type) {
      case 'job': return <Briefcase className="w-5 h-5" />
      case 'course': return <BookOpen className="w-5 h-5" />
      case 'tool': return <Wrench className="w-5 h-5" />
      default: return <Briefcase className="w-5 h-5" />
    }
  }

  const getTypeCount = (type) => {
    if (!resources.jobs) return 0

    switch (type) {
      case 'all': return resources.jobs.length + resources.courses.length + resources.tools.length
      case 'job': return resources.jobs.length
      case 'course': return resources.courses.length
      case 'tool': return resources.tools.length
      default: return 0
    }
  }

  const getNextPlanInfo = (currentPlan) => {
    if (currentPlan === 'free') {
      return { name: 'Pro', price: '200 PKR', limit: 200 }
    } else if (currentPlan === 'pro') {
      return { name: 'Enterprise', price: '400 PKR', limit: -1 }
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free Resources for Everyone 🚀
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing job opportunities, free courses, and useful tools to boost your career.
            All resources are carefully curated and completely free!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for jobs, courses, tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { key: 'all', label: 'All Resources', icon: <Filter className="w-4 h-4" /> },
              { key: 'job', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
              { key: 'course', label: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
              { key: 'tool', label: 'Tools', icon: <Wrench className="w-4 h-4" /> }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {icon}
                <span className="ml-2">{label}</span>
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {getTypeCount(key)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            Showing {filteredResources.length} of {resources.length} resources
            {searchTerm && ` for "${searchTerm}"`}
            {selectedType !== 'all' && ` in ${selectedType}s`}
          </p>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isSaved={savedResources.has(resource.id)}
                  onSaveToggle={(resourceId, isSaved) => {
                    if (isSaved) {
                      setSavedResources(prev => new Set([...prev, resourceId]))
                    } else {
                      setSavedResources(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(resourceId)
                        return newSet
                      })
                    }
                  }}
                />
              ))}
            </div>

            {/* Show More Prompts for each resource type */}
            {userData && resources.hasMore && (
              <div className="space-y-8">
                {/* Jobs Show More */}
                {resources.hasMore.jobs && selectedType === 'all' || selectedType === 'job' && (
                  <ShowMorePrompt
                    resourceType="jobs"
                    currentPlan={userData.subscription?.selected_plan || 'free'}
                    currentCount={resources.jobs.length}
                    totalAvailable={resources.totalAvailable || resources.jobs.length + 50}
                    nextPlanLimit={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.limit || 200}
                    nextPlanName={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.name || 'Pro'}
                    nextPlanPrice={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.price || '200 PKR'}
                  />
                )}

                {/* Courses Show More */}
                {resources.hasMore.courses && (selectedType === 'all' || selectedType === 'course') && (
                  <ShowMorePrompt
                    resourceType="courses"
                    currentPlan={userData.subscription?.selected_plan || 'free'}
                    currentCount={resources.courses.length}
                    totalAvailable={resources.totalAvailable || resources.courses.length + 50}
                    nextPlanLimit={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.limit || 200}
                    nextPlanName={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.name || 'Pro'}
                    nextPlanPrice={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.price || '200 PKR'}
                  />
                )}

                {/* Tools Show More */}
                {resources.hasMore.tools && (selectedType === 'all' || selectedType === 'tool') && (
                  <ShowMorePrompt
                    resourceType="tools"
                    currentPlan={userData.subscription?.selected_plan || 'free'}
                    currentCount={resources.tools.length}
                    totalAvailable={resources.totalAvailable || resources.tools.length + 50}
                    nextPlanLimit={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.limit || 200}
                    nextPlanName={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.name || 'Pro'}
                    nextPlanPrice={getNextPlanInfo(userData.subscription?.selected_plan || 'free')?.price || '200 PKR'}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No resources match "${searchTerm}". Try different keywords.`
                : `No ${selectedType === 'all' ? '' : selectedType + ' '}resources available.`
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedType('all')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Call to Action */}
        {resources.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources available yet</h3>
            <p className="text-gray-600 mb-4">
              We're working hard to add amazing resources for you. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && userData && (
        <UpgradePrompt
          currentPlan={userData.subscription?.selected_plan || 'free'}
          resourceType="resources"
          onClose={() => setShowUpgradePrompt(false)}
          showModal={true}
        />
      )}
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    }>
      <ResourcesContent />
    </Suspense>
  )
}
