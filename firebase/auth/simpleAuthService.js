// Simplified Auth Service with better error handling
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

// Try both configs
let auth, db
try {
  const { auth: mainAuth, db: mainDb } = await import('../firebase.config')
  auth = mainAuth
  db = mainDb
} catch (error) {
  console.log('Main config failed, trying fallback...')
  const { auth: fallbackAuth, db: fallbackDb } = await import('../firebase-fallback.config')
  auth = fallbackAuth
  db = fallbackDb
}

// Simple registration with retry logic
export const registerUserSimple = async (userData) => {
  const maxRetries = 3
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Registration attempt ${attempt}/${maxRetries}`)
      
      // Add delay between retries
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
      }
      
      const { email, password, name, phoneNumber, selectedPlan = 'free' } = userData
      
      // Validate phone number format
      if (!phoneNumber.match(/^\+92[0-9]{10}$/)) {
        throw new Error('Phone number must be in format +92XXXXXXXXXX')
      }
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Create user document in Firestore
      const userDocData = {
        profile: {
          name,
          email,
          phone_number: phoneNumber,
          created_at: serverTimestamp(),
          last_login: serverTimestamp(),
          email_verified: false
        },
        subscription: {
          selected_plan: selectedPlan,
          approval_status: selectedPlan === 'free' ? 'approved' : 'pending',
          approved_by: null,
          approved_at: selectedPlan === 'free' ? serverTimestamp() : null,
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
          saved_resources: [],
          viewed_resources: [],
          application_history: []
        }
      }
      
      await setDoc(doc(db, 'users', user.uid), userDocData)
      
      return {
        success: true,
        user: user,
        message: 'Account created successfully!'
      }
      
    } catch (error) {
      console.error(`Registration attempt ${attempt} failed:`, error)
      lastError = error
      
      // Don't retry for certain errors
      if (error.code === 'auth/email-already-in-use' || 
          error.code === 'auth/invalid-email' ||
          error.code === 'auth/weak-password') {
        break
      }
    }
  }
  
  return {
    success: false,
    error: lastError?.message || 'Registration failed after multiple attempts'
  }
}

// Simple login with retry logic
export const loginUserSimple = async (email, password) => {
  const maxRetries = 3
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Login attempt ${attempt}/${maxRetries}`)
      
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      return {
        success: true,
        user: user,
        message: 'Login successful'
      }
      
    } catch (error) {
      console.error(`Login attempt ${attempt} failed:`, error)
      lastError = error
      
      // Don't retry for certain errors
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-email') {
        break
      }
    }
  }
  
  return {
    success: false,
    error: lastError?.message || 'Login failed after multiple attempts'
  }
}

// Logout
export const logoutUserSimple = async () => {
  try {
    await signOut(auth)
    return {
      success: true,
      message: 'Logout successful'
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Auth state observer
export const onAuthStateChangeSimple = (callback) => {
  return onAuthStateChanged(auth, callback)
}
