// User Activity Service - Track saved resources, history, applications
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { ensureUserDocument } from './userDocumentService'

// Get user's saved resources
export const getSavedResources = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const savedResources = userData.activity?.saved_resources || []

      // Remove duplicates based on ID
      const uniqueResources = savedResources.filter((resource, index, self) =>
        index === self.findIndex(r => r.id === resource.id)
      )

      // If we found duplicates, update the database
      if (uniqueResources.length !== savedResources.length) {
        console.log('Removing duplicate saved resources...')
        await updateDoc(doc(db, 'users', userId), {
          'activity.saved_resources': uniqueResources
        })
      }

      return {
        success: true,
        data: uniqueResources
      }
    }
    return {
      success: true,
      data: []
    }
  } catch (error) {
    console.error('Error getting saved resources:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

// Save a resource
export const saveResource = async (userId, resourceData) => {
  try {
    const userDocRef = doc(db, 'users', userId)

    // Try to get user document first
    let userDoc
    try {
      userDoc = await getDoc(userDocRef)
    } catch (error) {
      console.log('Error getting user document, will try to create it')
    }

    // If document doesn't exist, create it with the resource
    if (!userDoc || !userDoc.exists()) {
      console.log('Creating user document with saved resource')

      const resourceToSave = {
        id: resourceData.id,
        title: resourceData.title,
        type: resourceData.type,
        description: resourceData.description,
        location: resourceData.location,
        duration: resourceData.duration,
        source_url: resourceData.source_url,
        saved_at: new Date().toISOString()
      }

      // Create complete user document with the saved resource
      const userData = {
        profile: {
          name: 'User',
          email: '',
          phone_number: '',
          created_at: new Date(),
          last_login: new Date(),
          email_verified: false
        },
        subscription: {
          selected_plan: 'free',
          approval_status: 'approved',
          approved_by: 'system',
          approved_at: new Date(),
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
          saved_resources: [resourceToSave],
          viewed_resources: [],
          application_history: []
        }
      }

      await setDoc(userDocRef, userData)
      return {
        success: true,
        message: 'Resource saved successfully (document created)'
      }
    }

    // Document exists, check if resource is already saved
    const userData = userDoc.data()
    const savedResources = userData.activity?.saved_resources || []

    // Check if resource is already saved
    const isAlreadySaved = savedResources.some(saved => saved.id === resourceData.id)

    if (isAlreadySaved) {
      return {
        success: false,
        error: 'Resource is already saved!',
        alreadySaved: true
      }
    }

    // Add to saved resources
    const resourceToSave = {
      id: resourceData.id,
      title: resourceData.title,
      type: resourceData.type,
      description: resourceData.description,
      location: resourceData.location,
      duration: resourceData.duration,
      source_url: resourceData.source_url,
      saved_at: new Date().toISOString()
    }

    await updateDoc(userDocRef, {
      'activity.saved_resources': arrayUnion(resourceToSave)
    })

    return {
      success: true,
      message: 'Resource saved successfully'
    }
  } catch (error) {
    console.error('Error saving resource:', error)
    return {
      success: false,
      error: 'Failed to save resource. Please try again.'
    }
  }
}

// Remove saved resource
export const removeSavedResource = async (userId, resourceId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const savedResources = userData.activity?.saved_resources || []
      const resourceToRemove = savedResources.find(r => r.id === resourceId)
      
      if (resourceToRemove) {
        await updateDoc(doc(db, 'users', userId), {
          'activity.saved_resources': arrayRemove(resourceToRemove)
        })
      }
    }

    return {
      success: true,
      message: 'Resource removed from saved'
    }
  } catch (error) {
    console.error('Error removing saved resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user's view history
export const getViewHistory = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        success: true,
        data: userData.activity?.viewed_resources || []
      }
    }
    return {
      success: true,
      data: []
    }
  } catch (error) {
    console.error('Error getting view history:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

// Add to view history
export const addToViewHistory = async (userId, resourceData) => {
  try {
    const viewRecord = {
      id: resourceData.id,
      title: resourceData.title,
      type: resourceData.type,
      viewed_at: new Date().toISOString(),
      source_url: resourceData.source_url
    }

    // Get current history to avoid duplicates
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const currentHistory = userData.activity?.viewed_resources || []
      
      // Remove existing entry for this resource
      const filteredHistory = currentHistory.filter(item => item.id !== resourceData.id)
      
      // Add new entry at the beginning (most recent first)
      const updatedHistory = [viewRecord, ...filteredHistory].slice(0, 100) // Keep only last 100 views
      
      await updateDoc(doc(db, 'users', userId), {
        'activity.viewed_resources': updatedHistory
      })
    }

    return {
      success: true,
      message: 'Added to view history'
    }
  } catch (error) {
    console.error('Error adding to view history:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user's job applications
export const getApplications = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        success: true,
        data: userData.activity?.application_history || []
      }
    }
    return {
      success: true,
      data: []
    }
  } catch (error) {
    console.error('Error getting applications:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

// Add job application
export const addApplication = async (userId, applicationData) => {
  try {
    const application = {
      id: applicationData.id || Date.now().toString(),
      job_title: applicationData.job_title,
      company: applicationData.company,
      applied_at: new Date().toISOString(),
      status: applicationData.status || 'pending',
      location: applicationData.location,
      job_type: applicationData.job_type,
      source_url: applicationData.source_url,
      notes: applicationData.notes || ''
    }

    await updateDoc(doc(db, 'users', userId), {
      'activity.application_history': arrayUnion(application)
    })

    return {
      success: true,
      message: 'Application added successfully'
    }
  } catch (error) {
    console.error('Error adding application:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update application status
export const updateApplicationStatus = async (userId, applicationId, newStatus, notes = '') => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const applications = userData.activity?.application_history || []
      
      const updatedApplications = applications.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,
            status: newStatus,
            notes: notes,
            updated_at: new Date().toISOString()
          }
        }
        return app
      })

      await updateDoc(doc(db, 'users', userId), {
        'activity.application_history': updatedApplications
      })
    }

    return {
      success: true,
      message: 'Application status updated'
    }
  } catch (error) {
    console.error('Error updating application status:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Clear view history
export const clearViewHistory = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      'activity.viewed_resources': []
    })

    return {
      success: true,
      message: 'View history cleared'
    }
  } catch (error) {
    console.error('Error clearing view history:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user activity stats
export const getUserActivityStats = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const activity = userData.activity || {}
      
      return {
        success: true,
        data: {
          savedResources: activity.saved_resources?.length || 0,
          viewedResources: activity.viewed_resources?.length || 0,
          applications: activity.application_history?.length || 0,
          totalResources: 156 // Mock total available resources
        }
      }
    }
    
    return {
      success: true,
      data: {
        savedResources: 0,
        viewedResources: 0,
        applications: 0,
        totalResources: 156
      }
    }
  } catch (error) {
    console.error('Error getting activity stats:', error)
    return {
      success: false,
      error: error.message,
      data: {
        savedResources: 0,
        viewedResources: 0,
        applications: 0,
        totalResources: 156
      }
    }
  }
}
