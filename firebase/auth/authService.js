import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase.config'
import { createOrUpdateUserDocument } from '../services/userDocumentService'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// User registration with complete profile setup
export const registerUser = async (userData) => {
  try {
    const { email, password, name, phoneNumber, selectedPlan = 'free' } = userData
    
    // Validate phone number format
    if (!phoneNumber.match(/^\+92[0-9]{10}$/)) {
      throw new Error('Phone number must be in format +92XXXXXXXXXX')
    }
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update user profile
    await updateProfile(user, { displayName: name })
    
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
        approval_status: 'pending', // All users require admin approval
        approved_by: null,
        approved_at: null,
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
    
    // Send email verification
    await sendEmailVerification(user)
    
    return {
      success: true,
      user: user,
      message: 'Account created successfully. Please verify your email.'
    }
    
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// User login with activity tracking
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Ensure user document exists and update last login
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist (shouldn't happen but safety check)
      await createOrUpdateUserDocument(user)
    } else {
      // Update last login timestamp
      await updateDoc(doc(db, 'users', user.uid), {
        'profile.last_login': serverTimestamp()
      })
    }
    
    return {
      success: true,
      user: user,
      message: 'Login successful'
    }
    
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Google OAuth login
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    // Always ensure user document is properly created/updated
    await createOrUpdateUserDocument(user)
    
    return {
      success: true,
      user: user,
      message: 'Google login successful'
    }
    
  } catch (error) {
    console.error('Google login error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Logout user
export const logoutUser = async () => {
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

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return {
      success: true,
      message: 'Password reset email sent'
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Get current user data from Firestore
export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return {
        success: true,
        data: { id: userDoc.id, ...userDoc.data() }
      }
    } else {
      return {
        success: false,
        error: 'User document not found'
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
