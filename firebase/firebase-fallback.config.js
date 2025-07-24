// Alternative Firebase Configuration with better error handling
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Direct configuration (fallback if env vars fail)
const firebaseConfig = {
  apiKey: "AIzaSyA4A0H6CA9KJkOnwhO9n48E9JQ92apHDtA",
  authDomain: "freezy-platform.firebaseapp.com",
  projectId: "freezy-platform",
  storageBucket: "freezy-platform.firebasestorage.app",
  messagingSenderId: "731975558688",
  appId: "1:731975558688:web:fb8df2fc33a8952e5fbe45"
}

// Initialize Firebase with error handling
let app, auth, db, storage

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  
  console.log('✅ Firebase initialized successfully')
  console.log('Project ID:', firebaseConfig.projectId)
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error)
}

// Configure auth settings for better connectivity
if (auth) {
  // Set custom timeout
  auth.settings = {
    appVerificationDisabledForTesting: false
  }
}

export { auth, db, storage }
export default app
