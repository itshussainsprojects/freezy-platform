'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange, getCurrentUserData } from '../../firebase/auth/authService'
import { checkAdminStatus } from '../../firebase/services/adminService'
import { ensureUserDocument, migrateUserApprovalStatus } from '../../firebase/services/userDocumentService'

interface UserData {
  id: string
  profile: {
    name: string
    email: string
    phone_number: string
    created_at: any
    last_login: any
    email_verified: boolean
  }
  subscription: {
    selected_plan: 'free' | 'pro' | 'enterprise'
    approval_status: 'pending' | 'approved' | 'rejected'
    approved_by: string | null
    approved_at: any
    plan_expires_at: any
  }
  preferences: {
    notification_settings: {
      email_notifications: boolean
      push_notifications: boolean
      job_alerts: boolean
      course_updates: boolean
      tool_recommendations: boolean
    }
    preferred_categories: string[]
    location_preferences: string[]
  }
  activity: {
    saved_resources: string[]
    viewed_resources: string[]
    application_history: any[]
  }
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  isAdmin: boolean
  loading: boolean
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
  refreshUserData: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshUserData = async () => {
    if (user) {
      try {
        // First, ensure user document exists and has all required fields
        await ensureUserDocument(user)

        // Run migration for existing users with approval issues
        await migrateUserApprovalStatus(user.uid)

        // Get user data from Firestore
        const userDataResult = await getCurrentUserData(user.uid)
        if (userDataResult.success) {
          setUserData(userDataResult.data as UserData)
        } else {
          // If still fails, provide fallback data
          console.log('Using fallback user data')
          setUserData({
            id: user.uid,
            profile: {
              name: user.displayName || 'User',
              email: user.email || '',
              phone_number: '',
              created_at: { toDate: () => new Date() },
              last_login: { toDate: () => new Date() },
              email_verified: user.emailVerified
            },
            subscription: {
              selected_plan: 'free',
              approval_status: 'approved',
              approved_by: 'system',
              approved_at: { toDate: () => new Date() },
              plan_expires_at: null
            },
            preferences: {
              notification_settings: {
                email_notifications: true,
                push_notifications: true,
                job_alerts: true,
                course_updates: true,
                tool_recommendations: true
              },
              preferred_categories: [],
              location_preferences: []
            },
            activity: {
              saved_resources: [],
              viewed_resources: [],
              application_history: []
            }
          } as UserData)
        }

        // Check admin status
        const adminResult = await checkAdminStatus(user.uid)
        setIsAdmin(adminResult.isAdmin)
      } catch (error) {
        console.error('Error refreshing user data:', error)
        // Provide fallback data to prevent crashes
        setUserData({
          id: user.uid,
          profile: {
            name: user.displayName || 'User',
            email: user.email || '',
            phone_number: '',
            created_at: { toDate: () => new Date() },
            last_login: { toDate: () => new Date() },
            email_verified: user.emailVerified
          },
          subscription: {
            selected_plan: 'free',
            approval_status: 'approved',
            approved_by: 'system',
            approved_at: { toDate: () => new Date() },
            plan_expires_at: null
          },
          preferences: {
            notification_settings: {
              email_notifications: true,
              push_notifications: true,
              job_alerts: true,
              course_updates: true,
              tool_recommendations: true
            },
            preferred_categories: [],
            location_preferences: []
          },
          activity: {
            saved_resources: [],
            viewed_resources: [],
            application_history: []
          }
        } as UserData)
      }
    } else {
      setUserData(null)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user)
      setLoading(true)
      
      if (user) {
        await refreshUserData()
      } else {
        setUserData(null)
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Refresh user data when user changes
  useEffect(() => {
    if (user && !loading) {
      refreshUserData()
    }
  }, [user])

  const value = {
    user,
    userData,
    isAdmin,
    loading,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
