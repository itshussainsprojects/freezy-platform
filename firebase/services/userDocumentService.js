// User Document Service - Ensure user documents have all required fields
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase.config'

// Default user document structure
const getDefaultUserData = (user) => ({
  profile: {
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    phone_number: '',
    created_at: serverTimestamp(),
    last_login: serverTimestamp(),
    email_verified: user.emailVerified || false
  },
  subscription: {
    selected_plan: 'free',
    approval_status: 'approved', // Free plan auto-approved
    approved_by: 'system',
    approved_at: serverTimestamp(),
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
})

// Ensure user document exists and has all required fields
export const ensureUserDocument = async (user) => {
  try {
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      // Create new user document
      const userData = getDefaultUserData(user)
      await setDoc(userDocRef, userData)
      console.log('✅ Created new user document for:', user.email)
      return { success: true, created: true }
    } else {
      // Check if document has all required fields
      const existingData = userDoc.data()
      const defaultData = getDefaultUserData(user)
      let needsUpdate = false
      const updates = {}
      
      // Check and add missing fields
      if (!existingData.activity) {
        updates.activity = defaultData.activity
        needsUpdate = true
      } else {
        if (!existingData.activity.saved_resources) {
          updates['activity.saved_resources'] = []
          needsUpdate = true
        }
        if (!existingData.activity.viewed_resources) {
          updates['activity.viewed_resources'] = []
          needsUpdate = true
        }
        if (!existingData.activity.application_history) {
          updates['activity.application_history'] = []
          needsUpdate = true
        }
      }
      
      if (!existingData.preferences) {
        updates.preferences = defaultData.preferences
        needsUpdate = true
      } else if (!existingData.preferences.notification_settings) {
        updates['preferences.notification_settings'] = defaultData.preferences.notification_settings
        needsUpdate = true
      }
      
      if (!existingData.subscription) {
        updates.subscription = defaultData.subscription
        needsUpdate = true
      } else {
        // Preserve existing subscription data, only add missing fields
        const currentSubscription = existingData.subscription
        const subscriptionUpdates = {}

        if (!currentSubscription.selected_plan) {
          subscriptionUpdates['subscription.selected_plan'] = 'free'
        }
        if (!currentSubscription.approval_status) {
          // Default to approved for free plan, pending for others
          const plan = currentSubscription.selected_plan || 'free'
          subscriptionUpdates['subscription.approval_status'] = plan === 'free' ? 'approved' : 'pending'
        }
        // IMPORTANT: Don't change existing approval status - preserve admin decisions
        if (!currentSubscription.approved_by && currentSubscription.approval_status === 'approved') {
          subscriptionUpdates['subscription.approved_by'] = 'system'
        }
        if (!currentSubscription.approved_at && currentSubscription.approval_status === 'approved') {
          subscriptionUpdates['subscription.approved_at'] = serverTimestamp()
        }

        if (Object.keys(subscriptionUpdates).length > 0) {
          Object.assign(updates, subscriptionUpdates)
          needsUpdate = true
        }
      }
      
      // Update last login
      updates['profile.last_login'] = serverTimestamp()
      needsUpdate = true
      
      if (needsUpdate) {
        await updateDoc(userDocRef, updates)
        console.log('✅ Updated user document with missing fields for:', user.email)
      }
      
      return { success: true, created: false, updated: needsUpdate }
    }
  } catch (error) {
    console.error('Error ensuring user document:', error)
    return { success: false, error: error.message }
  }
}

// Get user document with fallback
export const getUserDocumentSafe = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (userDoc.exists()) {
      return {
        success: true,
        data: userDoc.data()
      }
    } else {
      return {
        success: false,
        error: 'User document not found'
      }
    }
  } catch (error) {
    console.error('Error getting user document:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Create or update user document safely
export const createOrUpdateUserDocument = async (user, additionalData = {}) => {
  try {
    const userDocRef = doc(db, 'users', user.uid)
    const defaultData = getDefaultUserData(user)
    
    // Merge with additional data
    const userData = {
      ...defaultData,
      ...additionalData,
      profile: {
        ...defaultData.profile,
        ...additionalData.profile
      }
    }
    
    await setDoc(userDocRef, userData, { merge: true })
    console.log('✅ Created/updated user document for:', user.email)
    
    return { success: true }
  } catch (error) {
    console.error('Error creating/updating user document:', error)
    return { success: false, error: error.message }
  }
}

// Fix existing user document
export const fixUserDocument = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User document not found' }
    }
    
    const existingData = userDoc.data()
    const updates = {}
    
    // Ensure activity field exists
    if (!existingData.activity) {
      updates.activity = {
        saved_resources: [],
        viewed_resources: [],
        application_history: []
      }
    } else {
      if (!existingData.activity.saved_resources) {
        updates['activity.saved_resources'] = []
      }
      if (!existingData.activity.viewed_resources) {
        updates['activity.viewed_resources'] = []
      }
      if (!existingData.activity.application_history) {
        updates['activity.application_history'] = []
      }
    }
    
    // Ensure preferences field exists
    if (!existingData.preferences) {
      updates.preferences = {
        notification_settings: {
          email_notifications: true,
          push_notifications: true,
          job_alerts: true,
          course_updates: true,
          tool_recommendations: true
        },
        preferred_categories: [],
        location_preferences: []
      }
    }
    
    // Ensure subscription field exists
    if (!existingData.subscription) {
      updates.subscription = {
        selected_plan: 'free',
        approval_status: 'approved',
        approved_by: 'system',
        approved_at: serverTimestamp(),
        plan_expires_at: null
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await updateDoc(userDocRef, updates)
      console.log('✅ Fixed user document for user:', userId)
      return { success: true, updated: true }
    }
    
    return { success: true, updated: false }
  } catch (error) {
    console.error('Error fixing user document:', error)
    return { success: false, error: error.message }
  }
}

// Migration function to fix existing users with approval issues
export const migrateUserApprovalStatus = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' }
    }

    const userData = userDoc.data()
    const subscription = userData.subscription || {}

    // Fix approval status for free plan users
    if (subscription.selected_plan === 'free' && subscription.approval_status !== 'approved') {
      await updateDoc(userDocRef, {
        'subscription.approval_status': 'approved',
        'subscription.approved_by': 'system_migration',
        'subscription.approved_at': serverTimestamp()
      })

      console.log(`✅ Migrated free plan user to approved status: ${userData.profile?.email}`)
      return { success: true, migrated: true }
    }

    return { success: true, migrated: false }
  } catch (error) {
    console.error('Error migrating user approval status:', error)
    return { success: false, error: error.message }
  }
}
