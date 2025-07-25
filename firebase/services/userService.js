import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from '../firebase.config'

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    const updateData = {}
    Object.keys(profileData).forEach(key => {
      updateData[`profile.${key}`] = profileData[key]
    })
    
    await updateDoc(userRef, updateData)
    
    return {
      success: true,
      message: 'Profile updated successfully'
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update user subscription plan with smart approval logic
export const updateUserPlan = async (userId, planData) => {
  try {
    const userRef = doc(db, 'users', userId)

    // Get current user data to check existing approval status
    const userDoc = await getDoc(userRef)
    const currentData = userDoc.data()
    const currentPlan = currentData?.subscription?.selected_plan || 'free'
    const currentApprovalStatus = currentData?.subscription?.approval_status || 'pending'
    const currentApprovedBy = currentData?.subscription?.approved_by
    const currentApprovedAt = currentData?.subscription?.approved_at

    // CORRECTED: Smart approval logic for business model
    let newApprovalStatus = 'pending'
    let approvedBy = null
    let approvedAt = null

    if (planData.plan === 'free') {
      // Free plan is always approved
      newApprovalStatus = 'approved'
      approvedBy = 'system'
      approvedAt = serverTimestamp()
    } else {
      // PAID PLANS ALWAYS REQUIRE APPROVAL (to verify payment)
      // This is essential for business model - admin must verify payment
      newApprovalStatus = 'pending'
      approvedBy = null
      approvedAt = null

      console.log(`🔒 User ${userId} upgrading to ${planData.plan} - requires admin approval for payment verification`)
    }

    const updateData = {
      'subscription.selected_plan': planData.plan,
      'subscription.approval_status': newApprovalStatus,
      'subscription.approved_by': approvedBy,
      'subscription.approved_at': approvedAt,
      'subscription.plan_updated_at': serverTimestamp()
    }

    await updateDoc(userRef, updateData)

    const message = planData.plan === 'free'
      ? `Plan updated to ${planData.plan}. Access granted immediately.`
      : `Plan updated to ${planData.plan}. Please send payment screenshot via WhatsApp for admin approval.`

    return {
      success: true,
      message,
      approval_status: newApprovalStatus
    }
  } catch (error) {
    console.error('Error updating plan:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update notification preferences
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      'preferences.notification_settings': preferences
    })
    
    return {
      success: true,
      message: 'Notification preferences updated'
    }
  } catch (error) {
    console.error('Error updating preferences:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Add resource to saved list
export const saveResource = async (userId, resourceId) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      'activity.saved_resources': arrayUnion(resourceId)
    })
    
    return {
      success: true,
      message: 'Resource saved successfully'
    }
  } catch (error) {
    console.error('Error saving resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Remove resource from saved list
export const unsaveResource = async (userId, resourceId) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      'activity.saved_resources': arrayRemove(resourceId)
    })
    
    return {
      success: true,
      message: 'Resource removed from saved list'
    }
  } catch (error) {
    console.error('Error removing resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Track resource view
export const trackResourceView = async (userId, resourceId) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    // Add to viewed resources (keep only last 100 views)
    const userDoc = await getDoc(userRef)
    if (userDoc.exists()) {
      const viewedResources = userDoc.data().activity?.viewed_resources || []
      
      // Remove if already exists and add to front
      const updatedViewed = [resourceId, ...viewedResources.filter(id => id !== resourceId)].slice(0, 100)
      
      await updateDoc(userRef, {
        'activity.viewed_resources': updatedViewed
      })
    }
    
    return {
      success: true,
      message: 'Resource view tracked'
    }
  } catch (error) {
    console.error('Error tracking view:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Add application history
export const addApplicationHistory = async (userId, applicationData) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    const applicationEntry = {
      resource_id: applicationData.resourceId,
      resource_title: applicationData.resourceTitle,
      applied_at: serverTimestamp(),
      application_url: applicationData.applicationUrl,
      status: 'applied'
    }
    
    await updateDoc(userRef, {
      'activity.application_history': arrayUnion(applicationEntry)
    })
    
    return {
      success: true,
      message: 'Application recorded successfully'
    }
  } catch (error) {
    console.error('Error recording application:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user's saved resources
export const getUserSavedResources = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (userDoc.exists()) {
      const savedResourceIds = userDoc.data().activity?.saved_resources || []
      return {
        success: true,
        data: savedResourceIds
      }
    } else {
      return {
        success: false,
        error: 'User not found'
      }
    }
  } catch (error) {
    console.error('Error fetching saved resources:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user's application history
export const getUserApplicationHistory = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (userDoc.exists()) {
      const applicationHistory = userDoc.data().activity?.application_history || []
      return {
        success: true,
        data: applicationHistory.sort((a, b) => b.applied_at - a.applied_at)
      }
    } else {
      return {
        success: false,
        error: 'User not found'
      }
    }
  } catch (error) {
    console.error('Error fetching application history:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get users pending approval (Admin function)
export const getPendingApprovalUsers = async (lastDoc = null, limitCount = 20) => {
  try {
    let q = query(
      collection(db, 'users'),
      where('subscription.approval_status', '==', 'pending'),
      orderBy('profile.created_at', 'desc'),
      limit(limitCount)
    )
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const querySnapshot = await getDocs(q)
    const users = []
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      data: users,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    }
  } catch (error) {
    console.error('Error fetching pending users:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Check if user has access to resource level
export const checkResourceAccess = async (userId, resourceAccessLevel) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (!userDoc.exists()) {
      return { hasAccess: false, reason: 'User not found' }
    }
    
    const userData = userDoc.data()
    const userPlan = userData.subscription?.selected_plan || 'free'
    const approvalStatus = userData.subscription?.approval_status || 'pending'
    
    // Demo content is accessible to everyone
    if (resourceAccessLevel === 'demo') {
      return { hasAccess: true }
    }
    
    // Check if user is approved
    if (approvalStatus !== 'approved') {
      return { hasAccess: false, reason: 'Account pending approval' }
    }
    
    // Check plan access levels
    const accessHierarchy = {
      'free': ['demo', 'free'],
      'pro': ['demo', 'free', 'pro'],
      'enterprise': ['demo', 'free', 'pro', 'enterprise']
    }
    
    const userAccessLevels = accessHierarchy[userPlan] || ['demo']
    const hasAccess = userAccessLevels.includes(resourceAccessLevel)
    
    return {
      hasAccess,
      reason: hasAccess ? null : `Requires ${resourceAccessLevel} plan or higher`
    }
  } catch (error) {
    console.error('Error checking resource access:', error)
    return {
      hasAccess: false,
      reason: 'Error checking access'
    }
  }
}
