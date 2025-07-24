'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Clock, ArrowLeft, ExternalLink, Eye, Calendar } from 'lucide-react'
import Link from 'next/link'
import { getViewHistory, clearViewHistory } from '../../../firebase/services/userActivityService'

export default function HistoryPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [viewHistory, setViewHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const handleClearHistory = async () => {
    if (user && confirm('Are you sure you want to clear all history?')) {
      try {
        const result = await clearViewHistory(user.uid)
        if (result.success) {
          setViewHistory([])
        }
      } catch (error) {
        console.error('Error clearing history:', error)
      }
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadViewHistory = async () => {
      if (user) {
        try {
          const result = await getViewHistory(user.uid)
          if (result.success) {
            setViewHistory(result.data)
          } else {
            console.error('Error loading view history:', result.error)
            setViewHistory([])
          }
        } catch (error) {
          console.error('Error loading view history:', error)
          setViewHistory([])
        } finally {
          setLoadingHistory(false)
        }
      }
    }

    loadViewHistory()
  }, [user])

  if (loading || loadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const viewed = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return viewed.toLocaleDateString()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-100 text-blue-800'
      case 'course': return 'bg-green-100 text-green-800'
      case 'tool': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const groupByDate = (history: any[]) => {
    const groups: { [key: string]: any[] } = {}
    
    history.forEach(item => {
      const date = new Date(item.viewed_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let groupKey = ''
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday'
      } else {
        groupKey = date.toLocaleDateString()
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })
    
    return groups
  }

  const groupedHistory = groupByDate(viewHistory)

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
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">View History</h1>
              <p className="text-gray-600">Resources you've recently viewed</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{viewHistory.length}</p>
              <p className="text-gray-600">Total Views</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{viewHistory.filter(r => r.type === 'job').length}</p>
              <p className="text-gray-600">Jobs Viewed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{viewHistory.filter(r => r.type === 'course').length}</p>
              <p className="text-gray-600">Courses Viewed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{viewHistory.filter(r => r.type === 'tool').length}</p>
              <p className="text-gray-600">Tools Viewed</p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-8">
          {Object.keys(groupedHistory).length > 0 ? (
            Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{date}</h2>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(item.type)}`}>
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">{getTimeAgo(item.viewed_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Again
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-600 mb-6">Start exploring resources to build your viewing history!</p>
              <Link
                href="/resources"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Resources
              </Link>
            </div>
          )}
        </div>

        {/* Clear History */}
        {viewHistory.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleClearHistory}
              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
