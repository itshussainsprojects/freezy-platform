'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Briefcase, ArrowLeft, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getApplications, updateApplicationStatus } from '../../../firebase/services/userActivityService'

export default function ApplicationsPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadApplications = async () => {
      if (user) {
        try {
          const result = await getApplications(user.uid)
          if (result.success) {
            setApplications(result.data)
          } else {
            console.error('Error loading applications:', result.error)
            setApplications([])
          }
        } catch (error) {
          console.error('Error loading applications:', error)
          setApplications([])
        } finally {
          setLoadingApplications(false)
        }
      }
    }

    loadApplications()
  }, [user])

  if (loading || loadingApplications) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />
      case 'interview': return <AlertCircle className="w-5 h-5" />
      case 'accepted': return <CheckCircle className="w-5 h-5" />
      case 'rejected': return <XCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'interview': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review'
      case 'interview': return 'Interview Stage'
      case 'accepted': return 'Accepted'
      case 'rejected': return 'Rejected'
      default: return 'Unknown'
    }
  }

  const statusCounts = {
    pending: applications.filter(app => app.status === 'pending').length,
    interview: applications.filter(app => app.status === 'interview').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length
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
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
              <p className="text-gray-600">Track your job application status</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{statusCounts.pending}</p>
              <p className="text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{statusCounts.interview}</p>
              <p className="text-gray-600">Interview</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{statusCounts.accepted}</p>
              <p className="text-gray-600">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{statusCounts.rejected}</p>
              <p className="text-gray-600">Rejected</p>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length > 0 ? (
            applications.map((application) => (
              <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{application.job_title}</h3>
                        <p className="text-gray-600">{application.company}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-gray-900">{application.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Job Type</p>
                        <p className="text-gray-900">{application.job_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Applied</p>
                        <p className="text-gray-900">{new Date(application.applied_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {application.notes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{application.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-2">{getStatusText(application.status)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <a
                          href={application.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Job
                        </a>
                        <button className="inline-flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6">Start applying to jobs to track your applications here!</p>
              <Link
                href="/resources"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          )}
        </div>

        {/* Add Application Button */}
        {applications.length > 0 && (
          <div className="mt-8 text-center">
            <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Briefcase className="w-5 h-5 mr-2" />
              Add New Application
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
