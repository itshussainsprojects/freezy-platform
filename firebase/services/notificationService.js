// FREE Notification Service - Browser Notifications Only
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db, requestNotificationPermission, showBrowserNotification } from '../firebase.config'

// Initialize browser notifications (FREE - no FCM)
export const initializeNotifications = async (userId) => {
  try {
    const permissionResult = await requestNotificationPermission()

    if (permissionResult.success) {
      // Save notification preference to user document
      await updateDoc(doc(db, 'users', userId), {
        'preferences.browser_notifications_enabled': true,
        'preferences.notification_permission_granted_at': serverTimestamp()
      })

      return {
        success: true,
        message: 'Browser notifications enabled successfully'
      }
    } else {
      return {
        success: false,
        error: 'Notification permission denied'
      }
    }
  } catch (error) {
    console.error('Error initializing notifications:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Send notification to specific user
export const sendUserNotification = async (userId, notificationData) => {
  try {
    const notification = {
      user_id: userId,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type || 'general',
      data: notificationData.data || {},
      is_read: false,
      created_at: serverTimestamp(),
      read_at: null
    }
    
    const docRef = await addDoc(collection(db, 'notifications'), notification)
    
    return {
      success: true,
      notificationId: docRef.id,
      message: 'Notification sent successfully'
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user notifications
export const getUserNotifications = async (userId, lastDoc = null, limitCount = 20) => {
  try {
    let q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    )
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const querySnapshot = await getDocs(q)
    const notifications = []
    
    querySnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      data: notifications,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === limitCount
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    
    await updateDoc(notificationRef, {
      is_read: true,
      read_at: serverTimestamp()
    })
    
    return {
      success: true,
      message: 'Notification marked as read'
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Mark all notifications as read for user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('is_read', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    const batch = writeBatch(db)
    
    querySnapshot.forEach(doc => {
      batch.update(doc.ref, {
        is_read: true,
        read_at: serverTimestamp()
      })
    })
    
    await batch.commit()
    
    return {
      success: true,
      message: `${querySnapshot.size} notifications marked as read`
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('is_read', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    
    return {
      success: true,
      count: querySnapshot.size
    }
  } catch (error) {
    console.error('Error getting unread count:', error)
    return {
      success: false,
      error: error.message,
      count: 0
    }
  }
}

// Notification templates
export const NotificationTemplates = {
  USER_APPROVED: (userName) => ({
    title: 'Account Approved! 🎉',
    body: `Welcome ${userName}! Your account has been approved. Start exploring premium resources now.`,
    type: 'approval',
    data: { action: 'account_approved' }
  }),
  
  USER_REJECTED: (reason) => ({
    title: 'Account Application Update',
    body: `Your account application was not approved. Reason: ${reason}`,
    type: 'rejection',
    data: { action: 'account_rejected' }
  }),
  
  NEW_RESOURCES: (resourceType, count) => ({
    title: `New ${resourceType}s Available!`,
    body: `${count} new ${resourceType}s have been added. Check them out now!`,
    type: 'new_resources',
    data: { 
      action: 'new_resources',
      resource_type: resourceType,
      count: count
    }
  }),
  
  PLAN_UPGRADED: (newPlan) => ({
    title: 'Plan Upgraded! ⭐',
    body: `Your plan has been upgraded to ${newPlan}. Enjoy your new benefits!`,
    type: 'plan_upgrade',
    data: { 
      action: 'plan_upgraded',
      new_plan: newPlan
    }
  }),
  
  RESOURCE_SAVED: (resourceTitle) => ({
    title: 'Resource Saved',
    body: `"${resourceTitle}" has been saved to your collection.`,
    type: 'resource_action',
    data: { 
      action: 'resource_saved',
      resource_title: resourceTitle
    }
  }),
  
  APPLICATION_REMINDER: (resourceTitle, deadline) => ({
    title: 'Application Deadline Reminder',
    body: `Don't forget to apply for "${resourceTitle}". Deadline: ${deadline}`,
    type: 'reminder',
    data: { 
      action: 'application_reminder',
      resource_title: resourceTitle,
      deadline: deadline
    }
  }),
  
  WEEKLY_DIGEST: (newResourcesCount) => ({
    title: 'Weekly Digest 📊',
    body: `This week: ${newResourcesCount} new resources added. Check out what's trending!`,
    type: 'digest',
    data: { 
      action: 'weekly_digest',
      new_resources_count: newResourcesCount
    }
  })
}

// Send templated notification
export const sendTemplatedNotification = async (userId, templateKey, ...templateArgs) => {
  try {
    const template = NotificationTemplates[templateKey]
    if (!template) {
      throw new Error(`Unknown notification template: ${templateKey}`)
    }
    
    const notificationData = template(...templateArgs)
    return await sendUserNotification(userId, notificationData)
  } catch (error) {
    console.error('Error sending templated notification:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Notification preferences management
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
    console.error('Error updating notification preferences:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Check notification permissions
export const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'not-supported'
  }
  
  return Notification.permission
}

// Request notification permission
export const requestNotificationPermissionManual = async () => {
  try {
    if (!('Notification' in window)) {
      return {
        success: false,
        error: 'Notifications not supported'
      }
    }
    
    const permission = await Notification.requestPermission()
    
    return {
      success: permission === 'granted',
      permission: permission,
      message: permission === 'granted' ? 'Permission granted' : 'Permission denied'
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
