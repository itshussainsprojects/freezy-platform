'use client'

import { useAuth } from '../contexts/AuthContext'
import { Clock, Mail, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface ApprovalGuardProps {
  children: React.ReactNode
}

export default function ApprovalGuard({ children }: ApprovalGuardProps) {
  const { user, userData, loading } = useAuth()

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If not logged in, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to access this page.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  // Check approval status
  const approvalStatus = userData?.subscription?.approval_status

  // If approved, show the protected content
  if (approvalStatus === 'approved') {
    return <>{children}</>
  }

  // If rejected, show rejection message
  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Rejected</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your application has been rejected. Please contact support for more information.
          </p>
          <div className="space-y-3">
            <Link
              href="mailto:admin@freezy.pk"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
            <div>
              <Link
                href="/auth/logout"
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If pending or unknown status, show pending approval message
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Approval Pending</h2>
        <p className="text-gray-600 mb-6">
          Your account is currently under review. You'll receive an email notification once your account has been approved.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">What happens next?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Our admin team will review your application</li>
                <li>• You'll receive an email notification with the decision</li>
                <li>• This usually takes 24-48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            <p>Applied: {userData?.profile?.created_at ? new Date(userData.profile.created_at.toDate ? userData.profile.created_at.toDate() : userData.profile.created_at).toLocaleDateString() : 'Recently'}</p>
            <p>Plan: {userData?.subscription?.selected_plan || 'Free'}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/auth/logout"
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
