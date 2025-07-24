import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase.config'

// Add new resource
export const addResource = async (resourceData) => {
  try {
    const resource = {
      metadata: {
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type, // 'job', 'internship', 'course', 'tool'
        category: resourceData.category,
        source_url: resourceData.sourceUrl,
        source_platform: resourceData.sourcePlatform,
        scraped_at: serverTimestamp()
      },
      content: {
        requirements: resourceData.requirements || [],
        benefits: resourceData.benefits || [],
        location: resourceData.location || '',
        duration: resourceData.duration || '',
        salary_range: resourceData.salaryRange || null,
        application_deadline: resourceData.applicationDeadline || null
      },
      visibility: {
        status: 'active',
        access_level: resourceData.accessLevel || 'free',
        is_featured: resourceData.isFeatured || false,
        priority_score: resourceData.priorityScore || 0
      },
      analytics: {
        view_count: 0,
        save_count: 0,
        application_count: 0,
        last_updated: serverTimestamp()
      }
    }
    
    const docRef = await addDoc(collection(db, 'resources'), resource)
    
    return {
      success: true,
      resourceId: docRef.id,
      message: 'Resource added successfully'
    }
  } catch (error) {
    console.error('Error adding resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get resources with filtering and pagination
export const getResources = async (filters = {}, lastDoc = null, limitCount = 20) => {
  try {
    let q = collection(db, 'resources')
    
    // Apply filters
    const constraints = [where('visibility.status', '==', 'active')]
    
    if (filters.type) {
      constraints.push(where('metadata.type', '==', filters.type))
    }
    
    if (filters.category) {
      constraints.push(where('metadata.category', '==', filters.category))
    }
    
    if (filters.accessLevel) {
      constraints.push(where('visibility.access_level', '==', filters.accessLevel))
    }
    
    if (filters.featured) {
      constraints.push(where('visibility.is_featured', '==', true))
    }
    
    // Add ordering
    const orderField = filters.sortBy || 'visibility.priority_score'
    const orderDirection = filters.sortOrder || 'desc'
    constraints.push(orderBy(orderField, orderDirection))
    
    // Add limit
    constraints.push(limit(limitCount))
    
    // Create query
    q = query(q, ...constraints)
    
    // Add pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const querySnapshot = await getDocs(q)
    const resources = []
    
    querySnapshot.forEach((doc) => {
      resources.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      data: resources,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === limitCount
    }
  } catch (error) {
    console.error('Error fetching resources:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get single resource by ID
export const getResourceById = async (resourceId) => {
  try {
    const resourceDoc = await getDoc(doc(db, 'resources', resourceId))
    
    if (resourceDoc.exists()) {
      return {
        success: true,
        data: {
          id: resourceDoc.id,
          ...resourceDoc.data()
        }
      }
    } else {
      return {
        success: false,
        error: 'Resource not found'
      }
    }
  } catch (error) {
    console.error('Error fetching resource:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Search resources
export const searchResources = async (searchTerm, filters = {}, lastDoc = null, limitCount = 20) => {
  try {
    // Note: This is a basic implementation. For production, consider using Algolia or Elasticsearch
    let q = collection(db, 'resources')
    
    const constraints = [
      where('visibility.status', '==', 'active')
    ]
    
    // Apply filters
    if (filters.type) {
      constraints.push(where('metadata.type', '==', filters.type))
    }
    
    if (filters.category) {
      constraints.push(where('metadata.category', '==', filters.category))
    }
    
    // For now, we'll fetch all matching resources and filter client-side
    // In production, implement proper full-text search
    constraints.push(orderBy('metadata.title'))
    constraints.push(limit(limitCount * 2)) // Fetch more to account for filtering
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc))
    }
    
    q = query(q, ...constraints)
    const querySnapshot = await getDocs(q)
    
    const resources = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const title = data.metadata?.title?.toLowerCase() || ''
      const description = data.metadata?.description?.toLowerCase() || ''
      const searchLower = searchTerm.toLowerCase()
      
      if (title.includes(searchLower) || description.includes(searchLower)) {
        resources.push({
          id: doc.id,
          ...data
        })
      }
    })
    
    return {
      success: true,
      data: resources.slice(0, limitCount),
      hasMore: resources.length === limitCount
    }
  } catch (error) {
    console.error('Error searching resources:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update resource analytics
export const updateResourceAnalytics = async (resourceId, analyticsType) => {
  try {
    const resourceRef = doc(db, 'resources', resourceId)
    
    const updateData = {
      'analytics.last_updated': serverTimestamp()
    }
    
    switch (analyticsType) {
      case 'view':
        updateData['analytics.view_count'] = increment(1)
        break
      case 'save':
        updateData['analytics.save_count'] = increment(1)
        break
      case 'unsave':
        updateData['analytics.save_count'] = increment(-1)
        break
      case 'application':
        updateData['analytics.application_count'] = increment(1)
        break
    }
    
    await updateDoc(resourceRef, updateData)
    
    return {
      success: true,
      message: 'Analytics updated'
    }
  } catch (error) {
    console.error('Error updating analytics:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get featured resources
export const getFeaturedResources = async (type = null, limitCount = 10) => {
  try {
    let constraints = [
      where('visibility.status', '==', 'active'),
      where('visibility.is_featured', '==', true),
      orderBy('visibility.priority_score', 'desc'),
      limit(limitCount)
    ]
    
    if (type) {
      constraints.splice(2, 0, where('metadata.type', '==', type))
    }
    
    const q = query(collection(db, 'resources'), ...constraints)
    const querySnapshot = await getDocs(q)
    
    const resources = []
    querySnapshot.forEach((doc) => {
      resources.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      data: resources
    }
  } catch (error) {
    console.error('Error fetching featured resources:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get resource categories
export const getResourceCategories = async (type = null) => {
  try {
    let q = collection(db, 'resources')
    
    if (type) {
      q = query(q, where('metadata.type', '==', type))
    }
    
    q = query(q, where('visibility.status', '==', 'active'))
    
    const querySnapshot = await getDocs(q)
    const categories = new Set()
    
    querySnapshot.forEach((doc) => {
      const category = doc.data().metadata?.category
      if (category) {
        categories.add(category)
      }
    })
    
    return {
      success: true,
      data: Array.from(categories).sort()
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Batch update resources (Admin function)
export const batchUpdateResources = async (updates) => {
  try {
    const batch = writeBatch(db)
    
    updates.forEach(update => {
      const resourceRef = doc(db, 'resources', update.id)
      batch.update(resourceRef, {
        ...update.data,
        'analytics.last_updated': serverTimestamp()
      })
    })
    
    await batch.commit()
    
    return {
      success: true,
      message: `${updates.length} resources updated successfully`
    }
  } catch (error) {
    console.error('Error batch updating resources:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Delete resource (Admin function)
export const deleteResource = async (resourceId) => {
  try {
    await deleteDoc(doc(db, 'resources', resourceId))
    
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
