// Sample data script for testing
// Run this in browser console or create a simple admin page to initialize data

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

// Sample resources data
const sampleResources = [
  {
    title: 'Frontend Developer - React',
    type: 'job',
    description: 'Join our team as a Frontend Developer working with React, Next.js, and TypeScript. We offer competitive salary and remote work options.',
    location: 'Karachi, Pakistan',
    company: 'TechCorp Solutions',
    duration: 'Full-time',
    requirements: 'React, JavaScript, CSS, HTML, Git',
    benefits: 'Health Insurance, Remote Work, Learning Budget, Flexible Hours',
    source_url: 'https://example.com/job1',
    status: 'active',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: 'admin'
  },
  {
    title: 'Complete React Course - Free',
    type: 'course',
    description: 'Master React from basics to advanced concepts. This comprehensive course covers hooks, context, routing, and state management.',
    location: 'Online',
    duration: '40 hours',
    requirements: 'Basic JavaScript knowledge',
    benefits: 'Certificate, Lifetime Access, Community Support',
    source_url: 'https://example.com/course1',
    status: 'active',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: 'admin'
  },
  {
    title: 'Figma Design Tool',
    type: 'tool',
    description: 'Professional design tool for UI/UX designers. Create stunning interfaces with collaborative features.',
    location: 'Web-based',
    duration: 'Free',
    requirements: 'None',
    benefits: 'Free Plan Available, Collaboration Features, Templates',
    source_url: 'https://figma.com',
    status: 'active',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: 'admin'
  },
  {
    title: 'Backend Developer - Node.js',
    type: 'job',
    description: 'Looking for an experienced Backend Developer to work with Node.js, Express, and MongoDB.',
    location: 'Lahore, Pakistan',
    company: 'StartupXYZ',
    duration: 'Full-time',
    requirements: 'Node.js, Express, MongoDB, REST APIs',
    benefits: 'Competitive Salary, Stock Options, Health Insurance',
    source_url: 'https://example.com/job2',
    status: 'active',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: 'admin'
  },
  {
    title: 'Python for Beginners',
    type: 'course',
    description: 'Learn Python programming from scratch. Perfect for beginners who want to start their coding journey.',
    location: 'Online',
    duration: '30 hours',
    requirements: 'None',
    benefits: 'Certificate, Projects, Mentor Support',
    source_url: 'https://example.com/course2',
    status: 'active',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: 'admin'
  },
  {
    title: 'VS Code Editor',
    type: 'tool',
    description: 'Free source-code editor with support for debugging, syntax highlighting, and extensions.',
    location: 'Desktop Application',
    duration: 'Free',
    requirements: 'Windows, Mac, or Linux',
    benefits: 'Free, Extensions, Git Integration, IntelliSense',
    source_url: 'https://code.visualstudio.com',
    status: 'active',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    created_by: 'admin'
  }
]

// Function to add sample resources
export const addSampleResources = async () => {
  try {
    console.log('Adding sample resources...')
    
    for (const resource of sampleResources) {
      await addDoc(collection(db, 'resources'), resource)
      console.log(`Added resource: ${resource.title}`)
    }
    
    console.log('All sample resources added successfully!')
    return { success: true, message: 'Sample resources added successfully' }
  } catch (error) {
    console.error('Error adding sample resources:', error)
    return { success: false, error: error.message }
  }
}

// Sample users data (for testing approval workflow)
const sampleUsers = [
  {
    profile: {
      name: 'Ahmed Khan',
      email: 'ahmed.khan@example.com',
      phone: '+92-300-1234567',
      location: 'Karachi, Pakistan',
      created_at: serverTimestamp(),
      email_verified: true,
      last_login: serverTimestamp()
    },
    subscription: {
      selected_plan: 'free',
      approval_status: 'pending',
      approved_by: null,
      approved_at: null,
      plan_expires_at: null
    },
    activity: {
      saved_resources: [],
      viewed_resources: [],
      application_history: []
    }
  },
  {
    profile: {
      name: 'Fatima Ali',
      email: 'fatima.ali@example.com',
      phone: '+92-301-9876543',
      location: 'Lahore, Pakistan',
      created_at: serverTimestamp(),
      email_verified: true,
      last_login: serverTimestamp()
    },
    subscription: {
      selected_plan: 'pro',
      approval_status: 'pending',
      approved_by: null,
      approved_at: null,
      plan_expires_at: null
    },
    activity: {
      saved_resources: [],
      viewed_resources: [],
      application_history: []
    }
  },
  {
    profile: {
      name: 'Hassan Sheikh',
      email: 'hassan.sheikh@example.com',
      phone: '+92-302-5555555',
      location: 'Islamabad, Pakistan',
      created_at: serverTimestamp(),
      email_verified: true,
      last_login: serverTimestamp()
    },
    subscription: {
      selected_plan: 'free',
      approval_status: 'approved',
      approved_by: 'admin',
      approved_at: serverTimestamp(),
      plan_expires_at: null
    },
    activity: {
      saved_resources: [],
      viewed_resources: [],
      application_history: []
    }
  }
]

// Function to add sample users
export const addSampleUsers = async () => {
  try {
    console.log('Adding sample users...')
    
    for (const user of sampleUsers) {
      await addDoc(collection(db, 'users'), user)
      console.log(`Added user: ${user.profile.name}`)
    }
    
    console.log('All sample users added successfully!')
    return { success: true, message: 'Sample users added successfully' }
  } catch (error) {
    console.error('Error adding sample users:', error)
    return { success: false, error: error.message }
  }
}

// Function to initialize all sample data
export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample data...')
    
    const resourcesResult = await addSampleResources()
    const usersResult = await addSampleUsers()
    
    if (resourcesResult.success && usersResult.success) {
      console.log('All sample data initialized successfully!')
      return { success: true, message: 'Sample data initialized successfully' }
    } else {
      throw new Error('Failed to initialize some sample data')
    }
  } catch (error) {
    console.error('Error initializing sample data:', error)
    return { success: false, error: error.message }
  }
}

// Usage instructions:
// 1. Import this in your admin component
// 2. Call initializeSampleData() from a button click
// 3. Check Firebase console to see the data

console.log('Sample data script loaded. Use initializeSampleData() to add sample data.')
