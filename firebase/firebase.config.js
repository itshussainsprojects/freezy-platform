import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing. Please check your .env.local file.')
  console.log('Required environment variables:')
  console.log('- NEXT_PUBLIC_FIREBASE_API_KEY')
  console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID')
  console.log('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services (FREE SPARK PLAN ONLY)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
    // Enable offline persistence
    db._delegate._databaseId = db._delegate._databaseId
  }).catch(error => {
    console.log('Offline persistence not available:', error)
  })
}

// Emulators disabled - using production Firebase for better Google Auth compatibility
// Connect to emulators in development (FREE PLAN) - TEMPORARILY DISABLED
/*
if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectStorageEmulator(storage, 'localhost', 9199)
    console.log('🔧 Connected to Firebase Emulators (Auth, Firestore, Storage)')
  } catch (error) {
    console.log('⚠️ Emulator connection failed:', error.message)
  }
}
*/

console.log('🔥 Using Production Firebase Services')

// Simple browser notifications (no FCM needed)
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      return { success: false, error: 'Notifications not supported' }
    }

    const permission = await Notification.requestPermission()
    return {
      success: permission === 'granted',
      permission: permission
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return { success: false, error: error.message }
  }
}

// Show browser notification (no FCM)
export const showBrowserNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      ...options
    })
  }
  return null
}

export default app
