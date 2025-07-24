'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ensureUserDocument } from '../../firebase/services/userDocumentService'

// This component automatically fixes user documents in the background
// Users never see this - it just works silently
export default function AutoFixUserDocument() {
  const { user } = useAuth()
  const [isFixed, setIsFixed] = useState(false)

  useEffect(() => {
    const autoFixUserDocument = async () => {
      if (user && !isFixed) {
        try {
          console.log('🔧 Auto-fixing user document in background...')
          const result = await ensureUserDocument(user)
          
          if (result.success) {
            console.log('✅ User document auto-fixed successfully')
            setIsFixed(true)
          } else {
            console.error('❌ Auto-fix failed:', result.error)
            // Try again in 5 seconds
            setTimeout(() => {
              setIsFixed(false)
            }, 5000)
          }
        } catch (error) {
          console.error('❌ Auto-fix error:', error)
          // Try again in 5 seconds
          setTimeout(() => {
            setIsFixed(false)
          }, 5000)
        }
      }
    }

    // Run auto-fix when user logs in
    if (user) {
      autoFixUserDocument()
    }
  }, [user, isFixed])

  // This component renders nothing - it works silently in the background
  return null
}
