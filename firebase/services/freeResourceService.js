// FREE Resource Service - No Cloud Functions Required
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
  increment
} from 'firebase/firestore'
import { db } from '../firebase.config'

// Predefined resource data (since we can't scrape automatically)
const SAMPLE_RESOURCES = {
  jobs: [
    {
      title: "Frontend Developer at TechCorp",
      description: "Join our team as a Frontend Developer. Work with React, Next.js, and modern web technologies.",
      type: "job",
      category: "software-development",
      location: "Karachi, Pakistan",
      requirements: ["React", "JavaScript", "CSS", "HTML"],
      benefits: ["Health Insurance", "Remote Work", "Learning Budget"],
      source_platform: "manual",
      access_level: "free"
    },
    {
      title: "Digital Marketing Specialist",
      description: "Looking for a creative Digital Marketing Specialist to join our growing team.",
      type: "job", 
      category: "marketing",
      location: "Lahore, Pakistan",
      requirements: ["Social Media Marketing", "Google Ads", "Content Creation"],
      benefits: ["Flexible Hours", "Performance Bonus"],
      source_platform: "manual",
      access_level: "free"
    }
  ],
  courses: [
    {
      title: "Complete Web Development Bootcamp",
      description: "Learn full-stack web development from scratch. HTML, CSS, JavaScript, React, Node.js",
      type: "course",
      category: "programming",
      location: "Online",
      duration: "12 weeks",
      requirements: ["Basic Computer Skills"],
      benefits: ["Certificate", "Lifetime Access", "Community Support"],
      source_platform: "manual",
      access_level: "free"
    },
    {
      title: "Digital Marketing Fundamentals",
      description: "Master the basics of digital marketing including SEO, social media, and email marketing.",
      type: "course",
      category: "marketing", 
      location: "Online",
      duration: "8 weeks",
      requirements: ["None"],
      benefits: ["Certificate", "Real Projects", "Mentorship"],
      source_platform: "manual",
      access_level: "pro"
    }
  ],
  tools: [
    {
      title: "Canva - Design Tool",
      description: "Free online design tool for creating graphics, presentations, and social media posts.",
      type: "tool",
      category: "design",
      location: "Web-based",
      requirements: ["Internet Connection"],
      benefits: ["Free Templates", "Easy to Use", "Collaboration"],
      source_platform: "manual",
      access_level: "demo"
    },
    {
      title: "VS Code - Code Editor",
      description: "Free, powerful code editor with extensions for all programming languages.",
      type: "tool",
      category: "development",
      location: "Desktop/Web",
      requirements: ["Windows/Mac/Linux"],
      benefits: ["Free", "Extensions", "Git Integration"],
      source_platform: "manual", 
      access_level: "free"
    }
  ]
}

// Initialize sample data (call this once when setting up)
export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample data...')
    
    // Check if data already exists
    const existingQuery = await getDocs(query(collection(db, 'resources'), limit(1)))
    if (!existingQuery.empty) {
      console.log('Sample data already exists')
      return { success: true, message: 'Data already exists' }
    }
    
    let totalAdded = 0
    
    // Add all sample resources
    for (const [type, resources] of Object.entries(SAMPLE_RESOURCES)) {
      for (const resource of resources) {
        const resourceData = {
          metadata: {
            title: resource.title,
            description: resource.description,
            type: resource.type,
            category: resource.category,
            source_url: '#',
            source_platform: resource.source_platform,
            scraped_at: serverTimestamp()
          },
          content: {
            requirements: resource.requirements || [],
            benefits: resource.benefits || [],
            location: resource.location || '',
            duration: resource.duration || '',
            salary_range: null,
            application_deadline: null
          },
          visibility: {
            status: 'active',
            access_level: resource.access_level,
            is_featured: Math.random() > 0.7,
            priority_score: Math.floor(Math.random() * 100)
          },
          analytics: {
            view_count: Math.floor(Math.random() * 50),
            save_count: Math.floor(Math.random() * 20),
            application_count: Math.floor(Math.random() * 10),
            last_updated: serverTimestamp()
          }
        }
        
        await addDoc(collection(db, 'resources'), resourceData)
        totalAdded++
      }
    }
    
    console.log(`Added ${totalAdded} sample resources`)
    return {
      success: true,
      message: `${totalAdded} sample resources added successfully`
    }
  } catch (error) {
    console.error('Error initializing sample data:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Add new resource manually (Admin function)
export const addResourceManually = async (resourceData) => {
  try {
    const resource = {
      metadata: {
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type,
        category: resourceData.category,
        source_url: resourceData.sourceUrl || '#',
        source_platform: 'manual',
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
        priority_score: resourceData.priorityScore || Math.floor(Math.random() * 100)
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

// Get resources with filtering (same as before)
export const getResources = async (filters = {}, lastDoc = null, limitCount = 20) => {
  try {
    let constraints = [where('visibility.status', '==', 'active')]
    
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
    
    const orderField = filters.sortBy || 'visibility.priority_score'
    const orderDirection = filters.sortOrder || 'desc'
    constraints.push(orderBy(orderField, orderDirection))
    constraints.push(limit(limitCount))
    
    let q = query(collection(db, 'resources'), ...constraints)
    
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

// Simple client-side search (no external search service needed)
export const searchResources = async (searchTerm, filters = {}) => {
  try {
    // Get all resources and filter client-side
    const allResources = await getResources(filters, null, 100)
    
    if (!allResources.success) {
      return allResources
    }
    
    const searchLower = searchTerm.toLowerCase()
    const filteredResources = allResources.data.filter(resource => {
      const title = resource.metadata?.title?.toLowerCase() || ''
      const description = resource.metadata?.description?.toLowerCase() || ''
      const category = resource.metadata?.category?.toLowerCase() || ''
      
      return title.includes(searchLower) || 
             description.includes(searchLower) || 
             category.includes(searchLower)
    })
    
    return {
      success: true,
      data: filteredResources,
      hasMore: false
    }
  } catch (error) {
    console.error('Error searching resources:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update resource analytics (same as before)
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
