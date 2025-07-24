'use client'

import { useState } from 'react'
import { auth, db } from '../../firebase/firebase.config'
import { signInAnonymously } from 'firebase/auth'
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'
import { getResources } from '../../firebase/services/adminService'

export default function TestFirebasePage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const testFirebaseConnection = async () => {
    setLoading(true)
    setStatus('Testing Firebase connection...')

    try {
      // Test 1: Check if Firebase is reachable
      setStatus('Testing Firebase API reachability...')
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword',
          returnSecureToken: true
        })
      })

      if (response.ok || response.status === 400) {
        setStatus('✅ Firebase API is reachable!')
      } else {
        setStatus('❌ Firebase API not reachable. Status: ' + response.status)
        return
      }

      // Test 2: Anonymous Auth
      setStatus('Testing Authentication...')
      const userCredential = await signInAnonymously(auth)
      setStatus('✅ Authentication working! User ID: ' + userCredential.user.uid)

      // Test 3: Firestore Write
      setStatus('Testing Firestore...')
      await setDoc(doc(db, 'test', 'connection'), {
        timestamp: new Date(),
        message: 'Firebase connection test successful'
      })
      setStatus('✅ All tests passed! Firebase is working correctly.')

    } catch (error: any) {
      console.error('Firebase test error:', error)
      setStatus('❌ Error: ' + error.message + ' | Code: ' + error.code)

      // Additional debugging info
      if (error.code === 'auth/network-request-failed') {
        setStatus(prev => prev + '\n\n🔍 Network issue detected. Possible causes:\n- Firewall blocking Firebase\n- VPN interference\n- Corporate network restrictions\n- DNS issues')
      }
    } finally {
      setLoading(false)
    }
  }

  const testResourcesOnly = async () => {
    setLoading(true)
    setStatus('Testing resources specifically...')

    try {
      // Test resources collection directly
      const resourcesRef = collection(db, 'resources')
      const snapshot = await getDocs(resourcesRef)
      setStatus(prev => prev + `\n✅ Found ${snapshot.size} documents in resources collection`)

      // Test admin service
      const result = await getResources()
      if (result.success) {
        setStatus(prev => prev + `\n✅ Admin service returned ${result.data.length} resources`)

        if (result.data.length > 0) {
          setStatus(prev => prev + '\n\n📋 All resources:')
          result.data.forEach((resource, index) => {
            setStatus(prev => prev + `\n${index + 1}. ${resource.title} (${resource.type}) - ${resource.status}`)
          })
        } else {
          setStatus(prev => prev + '\n⚠️ No resources found - try adding some via admin panel')
        }
      } else {
        setStatus(prev => prev + `\n❌ Admin service error: ${result.error}`)
      }
    } catch (error) {
      setStatus(prev => prev + `\n❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Firebase Connection Test</h1>
        
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Current Configuration:</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
            <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</p>
            <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10)}...</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={testFirebaseConnection}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Firebase Connection'}
          </button>

          <button
            onClick={testResourcesOnly}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Resources Only'}
          </button>
        </div>

        {status && (
          <div className={`p-4 rounded-lg ${
            status.includes('❌') ? 'bg-red-50 text-red-800' : 
            status.includes('✅') ? 'bg-green-50 text-green-800' : 
            'bg-blue-50 text-blue-800'
          }`}>
            <p className="text-sm">{status}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-700">← Back to Home</a>
        </div>
      </div>
    </div>
  )
}
