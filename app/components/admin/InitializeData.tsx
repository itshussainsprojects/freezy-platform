'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../firebase/firebase.config'

export default function InitializeData() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [initialized, setInitialized] = useState(false)

  const sampleResources = [
    {
      title: 'Frontend Developer - React',
      type: 'job',
      description: 'Join our team as a Frontend Developer working with React, Next.js, and TypeScript.',
      location: 'Karachi, Pakistan',
      company: 'TechCorp Solutions',
      duration: 'Full-time',
      requirements: 'React, JavaScript, CSS, HTML, Git',
      benefits: 'Health Insurance, Remote Work, Learning Budget',
      source_url: 'https://example.com/job1',
      status: 'active',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      created_by: 'admin'
    },
    {
      title: 'Complete React Course - Free',
      type: 'course',
      description: 'Master React from basics to advanced concepts.',
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
      description: 'Professional design tool for UI/UX designers.',
      location: 'Web-based',
      duration: 'Free',
      requirements: 'None',
      benefits: 'Free Plan Available, Collaboration Features',
      source_url: 'https://figma.com',
      status: 'active',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      created_by: 'admin'
    }
  ]

  const handleInitialize = async () => {
    setLoading(true)
    setMessage('')

    try {
      console.log('Adding sample resources...')

      for (const resource of sampleResources) {
        await addDoc(collection(db, 'resources'), resource)
        console.log(`Added resource: ${resource.title}`)
      }

      setMessage('Sample data added successfully! Check the resources page.')
      setInitialized(true)
      console.log('All sample resources added successfully!')
    } catch (error) {
      console.error('Error adding sample resources:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        Initialize Sample Data
      </h2>
      
      <p className="text-gray-600 mb-6">
        This will add sample jobs, courses, and tools to your Freezy platform. 
        Perfect for testing and getting started quickly!
      </p>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">What will be added:</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• 2 Sample Jobs (Frontend Developer, Marketing Specialist)</li>
            <li>• 2 Sample Courses (Web Development, Digital Marketing)</li>
            <li>• 2 Sample Tools (Canva, VS Code)</li>
            <li>• Different access levels (Demo, Free, Pro)</li>
            <li>• Sample analytics data</li>
          </ul>
        </div>
        
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            {message}
          </div>
        )}
        
        <button
          onClick={handleInitialize}
          disabled={loading || initialized}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            loading || initialized
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Initializing...
            </div>
          ) : initialized ? (
            'Data Initialized ✓'
          ) : (
            'Initialize Sample Data'
          )}
        </button>
        
        {initialized && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Next Steps:</h3>
            <ul className="text-green-800 space-y-1">
              <li>• Visit the Resources page to see your sample data</li>
              <li>• Test the search and filtering functionality</li>
              <li>• Create user accounts to test access levels</li>
              <li>• Add more resources manually through the admin panel</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// Quick stats component
export function DataStats() {
  const [stats, setStats] = useState({
    jobs: 0,
    courses: 0,
    tools: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  // This would fetch actual stats from Firestore
  // For now, showing sample data
  useState(() => {
    setTimeout(() => {
      setStats({
        jobs: 2,
        courses: 2,
        tools: 2,
        total: 6
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">Total Resources</p>
        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">Jobs</p>
        <p className="text-2xl font-bold text-green-600">{stats.jobs}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">Courses</p>
        <p className="text-2xl font-bold text-purple-600">{stats.courses}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">Tools</p>
        <p className="text-2xl font-bold text-orange-600">{stats.tools}</p>
      </div>
    </div>
  )
}
