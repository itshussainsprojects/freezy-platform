'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fixUserDocument } from '../../firebase/services/userDocumentService'
import { Wrench, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FixAccountPage() {
  const { user, refreshUserData } = useAuth()
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState('')
  const router = useRouter()

  const handleFixAccount = async () => {
    if (!user) {
      setResult('❌ Please login first')
      return
    }

    setFixing(true)
    setResult('🔧 Fixing your account...')

    try {
      const fixResult = await fixUserDocument(user.uid)
      
      if (fixResult.success) {
        if (fixResult.updated) {
          setResult('✅ Account fixed successfully! Your user document has been updated with missing fields.')
        } else {
          setResult('✅ Account is already in good shape! No fixes needed.')
        }
        
        // Refresh user data
        setTimeout(async () => {
          await refreshUserData()
          setResult(prev => prev + '\n🔄 User data refreshed!')
        }, 1000)
      } else {
        setResult(`❌ Error fixing account: ${fixResult.error}`)
      }
    } catch (error) {
      setResult(`❌ Unexpected error: ${error.message}`)
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fix Account</h1>
          <p className="text-gray-600">
            If you're experiencing issues with saving resources or updating settings, 
            this tool will fix your account structure.
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Current User:</h3>
              <p className="text-blue-800">{user.email}</p>
              <p className="text-blue-700 text-sm">UID: {user.uid}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">What this fixes:</h3>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Missing activity fields (saved resources, history)</li>
                <li>• Missing preferences and notification settings</li>
                <li>• Missing subscription information</li>
                <li>• Document structure inconsistencies</li>
              </ul>
            </div>

            <button
              onClick={handleFixAccount}
              disabled={fixing}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                fixing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {fixing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Fixing Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Fix My Account
                </div>
              )}
            </button>

            {result && (
              <div className={`p-4 rounded-lg whitespace-pre-line ${
                result.includes('❌') 
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : result.includes('✅')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}>
                {result}
              </div>
            )}

            {result.includes('✅') && (
              <div className="text-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Logged In</h3>
            <p className="text-gray-600 mb-4">Please login to fix your account.</p>
            <a
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </a>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            This tool is safe and will only add missing fields to your account. 
            It won't delete or modify existing data.
          </p>
        </div>
      </div>
    </div>
  )
}
