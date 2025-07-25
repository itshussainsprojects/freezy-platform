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

// Plan-based resource limits - TEMPORARILY INCREASED FOR DEBUGGING
const PLAN_LIMITS = {
  free: {
    total: 100, // Increased from 40 to see more resources
    jobs: 50,   // Increased from 10
    courses: 30, // Increased from 15
    tools: 20   // Increased from 15
  },
  pro: {
    total: 200,
    jobs: 80,
    courses: 60,
    tools: 60
  },
  enterprise: {
    total: -1, // unlimited
    jobs: -1,
    courses: -1,
    tools: -1
  }
}

// Helper function to normalize resource data (handle both old and new structures)
const normalizeResource = (doc) => {
  try {
    const data = doc.data()

    if (!data) {
      console.warn(`Document ${doc.id} has no data`)
      return null
    }

    // New structure (with metadata, content, etc.)
    if (data.metadata && data.metadata.title) {
      return {
        id: doc.id,
        title: data.metadata.title || 'Untitled',
        description: data.metadata.description || 'No description available',
        type: data.metadata.type || 'job',
        company: data.content?.company || 'Company',
        location: data.content?.location || 'Location not specified',
        duration: data.content?.duration || '',
        requirements: data.content?.requirements || '',
        benefits: data.content?.benefits || '',
        source_url: data.metadata.source_url || '',
        created_at: data.metadata.created_at,
        status: data.visibility?.status || data.status || 'active', // Check both locations
        access_level: data.visibility?.access_level || 'free'
      }
    }

    // Old structure (flat) - assign default access level
    if (data.title) {
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        description: data.description || 'No description available',
        type: data.type || 'job',
        company: data.company || 'Company',
        location: data.location || 'Location not specified',
        duration: data.duration || '',
        requirements: data.requirements || '',
        benefits: data.benefits || '',
        source_url: data.source_url || '',
        created_at: data.created_at,
        status: data.status || 'active',
        access_level: 'free' // Default old resources to free tier
      }
    }

    console.warn(`Document ${doc.id} has invalid structure:`, data)
    return null

  } catch (error) {
    console.error(`Error normalizing document ${doc.id}:`, error)
    return null
  }
}

// Get resources with plan-based limits and filtering
export const getResources = async (filters = {}, lastDoc = null, limitCount = 20, userPlan = 'free') => {
  try {
    console.log(`🔍 getResources called with plan: ${userPlan}, limit: ${limitCount}`)

    // Get all resources first, then filter in JavaScript to handle both old and new structures
    let q = collection(db, 'resources')

    // Basic ordering by created_at (works for both structures)
    q = query(q, orderBy('created_at', 'desc'), limit(limitCount * 5)) // Get more to account for filtering

    const querySnapshot = await getDocs(q)
    const allResources = []

    console.log(`📊 Raw documents fetched: ${querySnapshot.size}`)

    querySnapshot.forEach((doc) => {
      try {
        const normalizedResource = normalizeResource(doc)
        if (normalizedResource && normalizedResource.title) {
          allResources.push(normalizedResource)
        }
      } catch (error) {
        console.error(`Error normalizing resource ${doc.id}:`, error)
      }
    })

    console.log(`📋 Normalized resources: ${allResources.length}`)

    // Apply plan-based access level filtering
    const planAccessLevels = {
      free: ['demo', 'free'],
      pro: ['demo', 'free', 'pro'],
      enterprise: ['demo', 'free', 'pro', 'enterprise']
    }

    const allowedLevels = planAccessLevels[userPlan] || ['demo', 'free']
    console.log(`🔒 Allowed access levels for ${userPlan}:`, allowedLevels)

    // Filter resources based on plan access and other criteria
    let filteredResources = allResources.filter(resource => {
      // Check if resource is active (be more lenient - if no status, assume active)
      if (resource.status && resource.status !== 'active') {
        console.log(`❌ Resource ${resource.title} blocked - status: ${resource.status}`)
        return false
      }

      // For old resources without access_level, default to 'free'
      const resourceAccessLevel = resource.access_level || 'free'

      // Check access level (be more lenient for debugging)
      if (!allowedLevels.includes(resourceAccessLevel)) {
        console.log(`❌ Resource ${resource.title} blocked - access level: ${resourceAccessLevel}, allowed: ${allowedLevels}`)
        return false
      }

      // Apply type filter
      if (filters.type && resource.type !== filters.type) return false

      // Apply category filter
      if (filters.category && resource.category !== filters.category) return false

      console.log(`✅ Resource ${resource.title} passed all filters`)
      return true
    })

    console.log(`✅ Filtered resources: ${filteredResources.length}`)

    // Limit results
    filteredResources = filteredResources.slice(0, limitCount)

    return {
      success: true,
      data: filteredResources,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: allResources.length > limitCount
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

// Get resources with plan-based limits - USE SAME METHOD AS ADMIN
export const getResourcesWithPlanLimits = async (userPlan = 'free', filters = {}) => {
  try {
    console.log(`🔍 Fetching resources for plan: ${userPlan}`)

    const planLimits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free

    // Use the SAME query as admin panel (which works and shows 88 resources)
    const q = query(
      collection(db, 'resources'),
      orderBy('created_at', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const allResources = []

    console.log(`📊 Raw documents from Firebase: ${querySnapshot.size}`)

    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data()

        // Use SAME normalization as admin panel
        let normalizedResource = null

        // New structure (with metadata)
        if (data.metadata && data.metadata.title) {
          normalizedResource = {
            id: doc.id,
            title: data.metadata.title,
            description: data.metadata.description || 'No description',
            type: data.metadata.type || 'job',
            company: data.content?.company || '',
            location: data.content?.location || '',
            duration: data.content?.duration || '',
            requirements: data.content?.requirements || '',
            benefits: data.content?.benefits || '',
            source_url: data.metadata.source_url || '',
            created_at: data.metadata.created_at,
            status: data.visibility?.status || data.status || 'active',
            access_level: data.visibility?.access_level || 'free'
          }
        }
        // Old structure (flat)
        else if (data.title) {
          normalizedResource = {
            id: doc.id,
            title: data.title,
            description: data.description || 'No description',
            type: data.type || 'job',
            company: data.company || '',
            location: data.location || '',
            duration: data.duration || '',
            requirements: data.requirements || '',
            benefits: data.benefits || '',
            source_url: data.source_url || '',
            created_at: data.created_at,
            status: data.status || 'active',
            access_level: 'free' // Default old resources to free
          }
        }

        if (normalizedResource) {
          // Only include active resources
          if (!normalizedResource.status || normalizedResource.status === 'active') {
            allResources.push(normalizedResource)
          }
        }
      } catch (error) {
        console.error(`Error processing resource ${doc.id}:`, error)
      }
    })

    console.log(`📋 Successfully processed: ${allResources.length} active resources`)

    // Separate by type
    const jobResources = allResources.filter(r => r.type === 'job')
    const courseResources = allResources.filter(r => r.type === 'course')
    const toolResources = allResources.filter(r => r.type === 'tool')

    console.log(`📊 By type - Jobs: ${jobResources.length}, Courses: ${courseResources.length}, Tools: ${toolResources.length}`)

    // Apply plan limits
    const results = {
      jobs: jobResources.slice(0, planLimits.jobs === -1 ? jobResources.length : planLimits.jobs),
      courses: courseResources.slice(0, planLimits.courses === -1 ? courseResources.length : planLimits.courses),
      tools: toolResources.slice(0, planLimits.tools === -1 ? toolResources.length : planLimits.tools),
      hasMore: {
        jobs: planLimits.jobs !== -1 && jobResources.length > planLimits.jobs,
        courses: planLimits.courses !== -1 && courseResources.length > planLimits.courses,
        tools: planLimits.tools !== -1 && toolResources.length > planLimits.tools
      },
      limits: planLimits,
      totalShown: 0,
      totalAvailable: allResources.length
    }

    results.totalShown = results.jobs.length + results.courses.length + results.tools.length

    console.log(`✅ Returning ${results.totalShown} resources for ${userPlan} plan`)
    console.log(`📊 Final counts - Jobs: ${results.jobs.length}, Courses: ${results.courses.length}, Tools: ${results.tools.length}`)

    return {
      success: true,
      data: results
    }
  } catch (error) {
    console.error('Error getting resources with plan limits:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Check if user has reached plan limits
export const checkPlanLimits = async (userPlan = 'free') => {
  try {
    const planLimits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free

    return {
      success: true,
      data: {
        limits: planLimits,
        isUnlimited: userPlan === 'enterprise',
        planName: userPlan.charAt(0).toUpperCase() + userPlan.slice(1)
      }
    }
  } catch (error) {
    console.error('Error checking plan limits:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
