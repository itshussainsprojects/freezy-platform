const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')
const cheerio = require('cheerio')

// Initialize Firebase Admin
admin.initializeApp()
const db = admin.firestore()

// Scheduled function to scrape resources every 6 hours
exports.scrapeResourcesScheduled = functions.pubsub
  .schedule('every 6 hours')
  .timeZone('Asia/Karachi')
  .onRun(async (context) => {
    console.log('Starting scheduled resource scraping...')
    
    const sources = [
      { 
        name: 'rozee', 
        url: 'https://www.rozee.pk/jobs', 
        type: 'job',
        accessLevel: 'free'
      },
      { 
        name: 'coursera', 
        url: 'https://www.coursera.org/browse', 
        type: 'course',
        accessLevel: 'pro'
      },
      { 
        name: 'upwork', 
        url: 'https://www.upwork.com/freelance-jobs/', 
        type: 'job',
        accessLevel: 'free'
      }
    ]
    
    const results = {
      successful: 0,
      failed: 0,
      totalResources: 0
    }
    
    for (const source of sources) {
      try {
        console.log(`Scraping from ${source.name}...`)
        const scrapedResources = await scrapeFromSource(source)
        
        if (scrapedResources.length > 0) {
          await batchInsertResources(scrapedResources, source.name)
          results.successful++
          results.totalResources += scrapedResources.length
          
          // Send notifications for new resources
          await sendNewResourceNotifications(scrapedResources, source.type)
        }
        
        await logScrapingActivity(source.name, 'success', scrapedResources.length)
        
      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error)
        results.failed++
        await logScrapingActivity(source.name, 'failed', 0, error.message)
      }
    }
    
    console.log('Scraping completed:', results)
    return results
  })

// Function to scrape from a specific source
async function scrapeFromSource(source) {
  try {
    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    })
    
    const $ = cheerio.load(response.data)
    const resources = []
    
    // Source-specific scraping logic
    switch (source.name) {
      case 'rozee':
        resources.push(...scrapeRozeeJobs($, source))
        break
      case 'coursera':
        resources.push(...scrapeCoursera($, source))
        break
      case 'upwork':
        resources.push(...scrapeUpwork($, source))
        break
    }
    
    return resources
    
  } catch (error) {
    console.error(`Scraping error for ${source.name}:`, error.message)
    throw error
  }
}

// Rozee.pk scraping logic
function scrapeRozeeJobs($, source) {
  const jobs = []
  
  $('.job-listing, .job-item, .job-card').each((i, element) => {
    try {
      const $job = $(element)
      
      const title = $job.find('.job-title, h3, h4').first().text().trim()
      const company = $job.find('.company-name, .employer').first().text().trim()
      const location = $job.find('.location, .job-location').first().text().trim()
      const description = $job.find('.job-description, .description').first().text().trim()
      const jobUrl = $job.find('a').first().attr('href')
      
      if (title && title.length > 10) {
        jobs.push({
          metadata: {
            title: `${title} at ${company}`,
            description: description || `Job opportunity at ${company} in ${location}`,
            type: source.type,
            category: 'general',
            source_url: jobUrl ? (jobUrl.startsWith('http') ? jobUrl : `https://www.rozee.pk${jobUrl}`) : source.url,
            source_platform: source.name
          },
          content: {
            requirements: [],
            benefits: [],
            location: location || 'Pakistan',
            duration: '',
            salary_range: null,
            application_deadline: null
          },
          visibility: {
            status: 'active',
            access_level: source.accessLevel,
            is_featured: false,
            priority_score: Math.floor(Math.random() * 100)
          }
        })
      }
    } catch (error) {
      console.error('Error parsing job:', error)
    }
  })
  
  return jobs.slice(0, 20) // Limit to 20 jobs per scrape
}

// Coursera scraping logic
function scrapeCoursera($, source) {
  const courses = []
  
  $('.course-card, .course-item, .rc-DesktopSearchCard').each((i, element) => {
    try {
      const $course = $(element)
      
      const title = $course.find('h3, .course-title, .card-title').first().text().trim()
      const provider = $course.find('.partner-name, .provider').first().text().trim()
      const description = $course.find('.description, .course-description').first().text().trim()
      const courseUrl = $course.find('a').first().attr('href')
      
      if (title && title.length > 5) {
        courses.push({
          metadata: {
            title: title,
            description: description || `Course by ${provider}`,
            type: source.type,
            category: 'online-learning',
            source_url: courseUrl ? (courseUrl.startsWith('http') ? courseUrl : `https://www.coursera.org${courseUrl}`) : source.url,
            source_platform: source.name
          },
          content: {
            requirements: [],
            benefits: ['Free course', 'Certificate available'],
            location: 'Online',
            duration: 'Self-paced',
            salary_range: null,
            application_deadline: null
          },
          visibility: {
            status: 'active',
            access_level: source.accessLevel,
            is_featured: Math.random() > 0.8,
            priority_score: Math.floor(Math.random() * 100)
          }
        })
      }
    } catch (error) {
      console.error('Error parsing course:', error)
    }
  })
  
  return courses.slice(0, 15) // Limit to 15 courses per scrape
}

// Upwork scraping logic
function scrapeUpwork($, source) {
  const jobs = []
  
  $('.job-tile, .job-card, .up-card-section').each((i, element) => {
    try {
      const $job = $(element)
      
      const title = $job.find('h4, .job-title, .up-n-link').first().text().trim()
      const description = $job.find('.description, .job-description').first().text().trim()
      const budget = $job.find('.budget, .hourly-rate').first().text().trim()
      const jobUrl = $job.find('a').first().attr('href')
      
      if (title && title.length > 10) {
        jobs.push({
          metadata: {
            title: title,
            description: description || 'Freelance opportunity on Upwork',
            type: source.type,
            category: 'freelance',
            source_url: jobUrl ? (jobUrl.startsWith('http') ? jobUrl : `https://www.upwork.com${jobUrl}`) : source.url,
            source_platform: source.name
          },
          content: {
            requirements: [],
            benefits: ['Remote work', 'Flexible hours'],
            location: 'Remote',
            duration: 'Project-based',
            salary_range: budget ? { description: budget } : null,
            application_deadline: null
          },
          visibility: {
            status: 'active',
            access_level: source.accessLevel,
            is_featured: false,
            priority_score: Math.floor(Math.random() * 100)
          }
        })
      }
    } catch (error) {
      console.error('Error parsing upwork job:', error)
    }
  })
  
  return jobs.slice(0, 10) // Limit to 10 jobs per scrape
}

// Batch insert resources with duplicate detection
async function batchInsertResources(resources, sourceName) {
  const batch = db.batch()
  let insertCount = 0
  
  for (const resource of resources) {
    try {
      // Check for duplicates based on title and source
      const existingQuery = await db.collection('resources')
        .where('metadata.title', '==', resource.metadata.title)
        .where('metadata.source_platform', '==', sourceName)
        .limit(1)
        .get()
      
      if (existingQuery.empty) {
        const docRef = db.collection('resources').doc()
        batch.set(docRef, {
          ...resource,
          metadata: {
            ...resource.metadata,
            scraped_at: admin.firestore.FieldValue.serverTimestamp()
          },
          analytics: {
            view_count: 0,
            save_count: 0,
            application_count: 0,
            last_updated: admin.firestore.FieldValue.serverTimestamp()
          }
        })
        insertCount++
      }
    } catch (error) {
      console.error('Error processing resource:', error)
    }
  }
  
  if (insertCount > 0) {
    await batch.commit()
    console.log(`Inserted ${insertCount} new resources from ${sourceName}`)
  }
  
  return insertCount
}

// Log scraping activity
async function logScrapingActivity(sourceName, status, resourceCount = 0, errorMessage = null) {
  try {
    await db.collection('scraping_logs').add({
      source: sourceName,
      status: status,
      resource_count: resourceCount,
      error_message: errorMessage,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.error('Error logging scraping activity:', error)
  }
}

// Send notifications for new resources
async function sendNewResourceNotifications(resources, resourceType) {
  try {
    // Get users who want notifications for this resource type
    const usersQuery = await db.collection('users')
      .where('subscription.approval_status', '==', 'approved')
      .where(`preferences.notification_settings.${resourceType}_alerts`, '==', true)
      .get()
    
    if (usersQuery.empty) return
    
    const tokens = []
    usersQuery.forEach(doc => {
      const userData = doc.data()
      if (userData.fcm_token) {
        tokens.push(userData.fcm_token)
      }
    })
    
    if (tokens.length === 0) return
    
    const message = {
      notification: {
        title: `New ${resourceType}s Available!`,
        body: `${resources.length} new ${resourceType}s have been added. Check them out now!`,
        icon: '/icons/notification-icon.png'
      },
      data: {
        resource_type: resourceType,
        resource_count: resources.length.toString(),
        click_action: 'OPEN_RESOURCES'
      }
    }
    
    // Send to all tokens in batches of 500
    const batchSize = 500
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize)
      try {
        await admin.messaging().sendMulticast({
          tokens: batch,
          ...message
        })
      } catch (error) {
        console.error('Error sending notification batch:', error)
      }
    }
    
    console.log(`Sent notifications to ${tokens.length} users`)
    
  } catch (error) {
    console.error('Error sending notifications:', error)
  }
}

// HTTP function to manually trigger scraping
exports.triggerScraping = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }
  
  const adminDoc = await db.collection('admins').doc(context.auth.uid).get()
  if (!adminDoc.exists()) {
    throw new functions.https.HttpsError('permission-denied', 'User must be admin')
  }
  
  try {
    // Trigger the scraping function
    const result = await scrapeResourcesScheduled.run()
    return { success: true, result }
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Scraping failed', error.message)
  }
})

// Function to clean up old resources
exports.cleanupOldResources = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Asia/Karachi')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const oldResourcesQuery = await db.collection('resources')
      .where('metadata.scraped_at', '<', thirtyDaysAgo)
      .where('visibility.status', '==', 'active')
      .get()
    
    const batch = db.batch()
    let updateCount = 0
    
    oldResourcesQuery.forEach(doc => {
      batch.update(doc.ref, { 'visibility.status': 'expired' })
      updateCount++
    })
    
    if (updateCount > 0) {
      await batch.commit()
      console.log(`Marked ${updateCount} resources as expired`)
    }
    
    return { expired: updateCount }
  })
