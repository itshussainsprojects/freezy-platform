// FREE Admin Service - Client-side only
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { showBrowserNotification } from '../firebase.config'

// Admin user approval with logging
export const approveUser = async (userId, adminId, planOverride = null) => {
  try {
    const batch = writeBatch(db)
    
    // Update user document
    const userRef = doc(db, 'users', userId)
    const updateData = {
      'subscription.approval_status': 'approved',
      'subscription.approved_by': adminId,
      'subscription.approved_at': serverTimestamp()
    }
    
    if (planOverride) {
      updateData['subscription.selected_plan'] = planOverride
    }
    
    batch.update(userRef, updateData)
    
    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: 'user_approved',
      target_user: userId,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: {
        plan_override: planOverride
      }
    })
    
    await batch.commit()

    // Send browser notification to admin
    showBrowserNotification('User Approved', {
      body: `User has been approved successfully`,
      icon: '/icons/success-icon.png'
    })

    return {
      success: true,
      message: 'User approved successfully'
    }
  } catch (error) {
    console.error('Error approving user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Reject user application
export const rejectUser = async (userId, adminId, reason = '') => {
  try {
    const batch = writeBatch(db)
    
    // Update user document
    const userRef = doc(db, 'users', userId)
    batch.update(userRef, {
      'subscription.approval_status': 'rejected',
      'subscription.approved_by': adminId,
      'subscription.approved_at': serverTimestamp()
    })
    
    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: 'user_rejected',
      target_user: userId,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: {
        reason: reason
      }
    })
    
    await batch.commit()
    
    // TODO: Send rejection notification to user
    // await sendUserRejectionNotification(userId, reason)
    
    return {
      success: true,
      message: 'User application rejected'
    }
  } catch (error) {
    console.error('Error rejecting user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Bulk approve users
export const bulkApproveUsers = async (userIds, adminId) => {
  try {
    const batch = writeBatch(db)
    const timestamp = serverTimestamp()
    
    userIds.forEach(userId => {
      // Update user document
      const userRef = doc(db, 'users', userId)
      batch.update(userRef, {
        'subscription.approval_status': 'approved',
        'subscription.approved_by': adminId,
        'subscription.approved_at': timestamp
      })
      
      // Log admin action
      const auditRef = doc(collection(db, 'admin_actions'))
      batch.set(auditRef, {
        action: 'user_approved',
        target_user: userId,
        admin_id: adminId,
        timestamp: timestamp,
        details: {
          bulk_operation: true
        }
      })
    })
    
    await batch.commit()
    
    return {
      success: true,
      message: `${userIds.length} users approved successfully`
    }
  } catch (error) {
    console.error('Error bulk approving users:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update user plan (Admin override)
export const updateUserPlanAdmin = async (userId, newPlan, adminId) => {
  try {
    const batch = writeBatch(db)
    
    // Update user document
    const userRef = doc(db, 'users', userId)
    batch.update(userRef, {
      'subscription.selected_plan': newPlan,
      'subscription.approval_status': 'approved',
      'subscription.approved_by': adminId,
      'subscription.approved_at': serverTimestamp()
    })
    
    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: 'plan_updated',
      target_user: userId,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: {
        new_plan: newPlan
      }
    })
    
    await batch.commit()
    
    return {
      success: true,
      message: `User plan updated to ${newPlan}`
    }
  } catch (error) {
    console.error('Error updating user plan:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get admin dashboard analytics
export const getAdminAnalytics = async () => {
  try {
    const analytics = {
      users: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        byPlan: {
          free: 0,
          pro: 0,
          enterprise: 0
        }
      },
      resources: {
        total: 0,
        byType: {
          job: 0,
          internship: 0,
          course: 0,
          tool: 0
        },
        byAccessLevel: {
          demo: 0,
          free: 0,
          pro: 0,
          enterprise: 0
        }
      }
    }
    
    // Get user analytics
    const usersQuery = query(collection(db, 'users'))
    const usersSnapshot = await getDocs(usersQuery)
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data()
      analytics.users.total++
      
      const status = userData.subscription?.approval_status || 'pending'
      analytics.users[status]++
      
      const plan = userData.subscription?.selected_plan || 'free'
      analytics.users.byPlan[plan]++
    })
    
    // Get resource analytics
    const resourcesQuery = query(collection(db, 'resources'))
    const resourcesSnapshot = await getDocs(resourcesQuery)
    
    resourcesSnapshot.forEach(doc => {
      const resourceData = doc.data()
      analytics.resources.total++
      
      const type = resourceData.metadata?.type || 'unknown'
      if (analytics.resources.byType[type] !== undefined) {
        analytics.resources.byType[type]++
      }
      
      const accessLevel = resourceData.visibility?.access_level || 'free'
      if (analytics.resources.byAccessLevel[accessLevel] !== undefined) {
        analytics.resources.byAccessLevel[accessLevel]++
      }
    })
    
    return {
      success: true,
      data: analytics
    }
  } catch (error) {
    console.error('Error fetching admin analytics:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get admin action logs
export const getAdminActionLogs = async (lastDoc = null, limitCount = 50) => {
  try {
    let q = query(
      collection(db, 'admin_actions'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const querySnapshot = await getDocs(q)
    const logs = []
    
    querySnapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      data: logs,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    }
  } catch (error) {
    console.error('Error fetching admin logs:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get ALL users (no pagination for admin)
export const getAllUsers = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('profile.created_at', 'desc')
    )

    const snapshot = await getDocs(q)
    const users = []

    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return {
      success: true,
      data: users
    }
  } catch (error) {
    console.error('Error getting all users:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

// Get users by status
export const getUsersByStatus = async (status, lastDoc = null, limitCount = 20) => {
  try {
    let q = query(
      collection(db, 'users'),
      where('subscription.approval_status', '==', status),
      orderBy('profile.created_at', 'desc'),
      limit(limitCount)
    )
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const querySnapshot = await getDocs(q)
    const users = []
    
    querySnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      data: users,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === limitCount
    }
  } catch (error) {
    console.error('Error fetching users by status:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Moderate resource content
export const moderateResource = async (resourceId, adminId, action, reason = '') => {
  try {
    const batch = writeBatch(db)
    
    // Update resource
    const resourceRef = doc(db, 'resources', resourceId)
    const updateData = {
      'analytics.last_updated': serverTimestamp()
    }
    
    if (action === 'approve') {
      updateData['visibility.status'] = 'active'
    } else if (action === 'reject') {
      updateData['visibility.status'] = 'removed'
    }
    
    batch.update(resourceRef, updateData)
    
    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: `resource_${action}`,
      target_resource: resourceId,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: {
        reason: reason
      }
    })
    
    await batch.commit()
    
    return {
      success: true,
      message: `Resource ${action}ed successfully`
    }
  } catch (error) {
    console.error('Error moderating resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Check if user is admin
export const checkAdminStatus = async (userId) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId))
    return {
      success: true,
      isAdmin: adminDoc.exists(),
      data: adminDoc.exists() ? adminDoc.data() : null
    }
  } catch (error) {
    console.error('Error checking admin status:', error)
    return {
      success: false,
      isAdmin: false,
      error: error.message
    }
  }
}

// Resource CRUD operations
export const getResourceById = async (resourceId) => {
  try {
    const resourceRef = doc(db, 'resources', resourceId)
    const resourceSnap = await getDoc(resourceRef)

    if (resourceSnap.exists()) {
      return {
        success: true,
        data: { id: resourceSnap.id, ...resourceSnap.data() }
      }
    } else {
      return {
        success: false,
        error: 'Resource not found'
      }
    }
  } catch (error) {
    console.error('Error getting resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const updateResource = async (resourceId, updateData, adminId) => {
  try {
    const batch = writeBatch(db)

    // Update resource
    const resourceRef = doc(db, 'resources', resourceId)
    batch.update(resourceRef, {
      ...updateData,
      updated_at: serverTimestamp(),
      updated_by: adminId
    })

    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: 'resource_updated',
      target_resource: resourceId,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: updateData
    })

    await batch.commit()

    return {
      success: true,
      message: 'Resource updated successfully'
    }
  } catch (error) {
    console.error('Error updating resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const deleteResource = async (resourceId, adminId) => {
  try {
    const batch = writeBatch(db)

    // Get resource data for logging
    const resourceRef = doc(db, 'resources', resourceId)
    const resourceSnap = await getDoc(resourceRef)

    if (!resourceSnap.exists()) {
      return {
        success: false,
        error: 'Resource not found'
      }
    }

    // Delete resource
    batch.delete(resourceRef)

    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: 'resource_deleted',
      target_resource: resourceId,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: {
        title: resourceSnap.data().title,
        type: resourceSnap.data().type
      }
    })

    await batch.commit()

    return {
      success: true,
      message: 'Resource deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// User CRUD operations
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return {
        success: true,
        data: { id: userSnap.id, ...userSnap.data() }
      }
    } else {
      return {
        success: false,
        error: 'User not found'
      }
    }
  } catch (error) {
    console.error('Error getting user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update user (admin function)
export const updateUserAdmin = async (userId, updateData, adminId) => {
  try {
    const batch = writeBatch(db)

    // Update user document
    const userRef = doc(db, 'users', userId)
    const updatePayload = {
      'profile.name': updateData.name,
      'profile.email': updateData.email,
      'profile.phone': updateData.phone,
      'profile.location': updateData.location,
      'profile.updated_at': serverTimestamp(),
      'subscription.selected_plan': updateData.selected_plan,
      'subscription.approval_status': updateData.approval_status
    }

    // If status is being changed to approved, add approval details
    if (updateData.approval_status === 'approved') {
      updatePayload['subscription.approved_by'] = adminId
      updatePayload['subscription.approved_at'] = serverTimestamp()
    }

    batch.update(userRef, updatePayload)

    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: 'user_updated',
      target_user: userId,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: updateData
    })

    await batch.commit()

    return {
      success: true,
      message: 'User updated successfully'
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Delete user (admin function)
export const deleteUserAdmin = async (userId, adminId) => {
  try {
    const batch = writeBatch(db)

    // Get user data for logging
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    const userData = userSnap.data()

    // Delete user document
    batch.delete(userRef)

    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: 'user_deleted',
      target_user: userId,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: {
        name: userData.profile?.name,
        email: userData.profile?.email,
        plan: userData.subscription?.selected_plan
      }
    })

    await batch.commit()

    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get ALL resources - Fixed: removed orderBy to include all documents
export const getResources = async () => {
  try {
    // Query without orderBy to get ALL documents (some don't have created_at field)
    const q = query(collection(db, 'resources'))

    const snapshot = await getDocs(q)
    const resources = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      resources.push({
        id: doc.id,
        ...data
      })
    })

    return {
      success: true,
      data: resources
    }
  } catch (error) {
    console.error('Error getting resources:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

// Create new resource
export const createResource = async (resourceData, adminId) => {
  try {
    const batch = writeBatch(db)

    // Create resource
    const resourceRef = doc(collection(db, 'resources'))
    batch.set(resourceRef, {
      ...resourceData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      created_by: adminId,
      status: resourceData.status || 'active'
    })

    // Log admin action
    const auditRef = doc(collection(db, 'admin_actions'))
    batch.set(auditRef, {
      action: 'resource_created',
      target_resource: resourceRef.id,
      admin_id: adminId,
      timestamp: serverTimestamp(),
      details: {
        title: resourceData.title,
        type: resourceData.type
      }
    })

    await batch.commit()

    return {
      success: true,
      message: 'Resource created successfully',
      id: resourceRef.id
    }
  } catch (error) {
    console.error('Error creating resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get admin dashboard statistics
export const getAdminStats = async () => {
  try {
    // Get user counts
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users = []
    usersSnapshot.forEach(doc => {
      users.push(doc.data())
    })

    // Get resource counts
    const resourcesSnapshot = await getDocs(collection(db, 'resources'))
    const resources = []
    resourcesSnapshot.forEach(doc => {
      resources.push(doc.data())
    })

    // Calculate statistics
    const stats = {
      users: {
        total: users.length,
        pending: users.filter(u => u.subscription?.approval_status === 'pending').length,
        approved: users.filter(u => u.subscription?.approval_status === 'approved').length,
        rejected: users.filter(u => u.subscription?.approval_status === 'rejected').length,
        free: users.filter(u => u.subscription?.selected_plan === 'free').length,
        pro: users.filter(u => u.subscription?.selected_plan === 'pro').length,
        enterprise: users.filter(u => u.subscription?.selected_plan === 'enterprise').length
      },
      resources: {
        total: resources.length,
        jobs: resources.filter(r => r.type === 'job').length,
        courses: resources.filter(r => r.type === 'course').length,
        tools: resources.filter(r => r.type === 'tool').length,
        active: resources.filter(r => r.status === 'active').length,
        inactive: resources.filter(r => r.status === 'inactive').length,
        pending: resources.filter(r => r.status === 'pending').length
      }
    }

    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return {
      success: false,
      error: error.message,
      data: {
        users: { total: 0, pending: 0, approved: 0, rejected: 0, free: 0, pro: 0, enterprise: 0 },
        resources: { total: 0, jobs: 0, courses: 0, tools: 0, active: 0, inactive: 0, pending: 0 }
      }
    }
  }
}

// Functions are already exported above with 'export const'
