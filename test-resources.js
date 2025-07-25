// Quick test to check if resources are being fetched correctly
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit } = require('firebase/firestore');

// Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  // You can get this from Firebase Console > Project Settings > General > Your apps
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testResourceFetch() {
  try {
    console.log('🔍 Testing resource fetch...');
    
    // Get all resources
    const q = query(
      collection(db, 'resources'),
      orderBy('created_at', 'desc'),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    console.log(`📊 Found ${snapshot.size} resources`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('\n📋 Resource:', doc.id);
      
      // Check if it's new structure (with metadata)
      if (data.metadata) {
        console.log('  📝 Title:', data.metadata.title);
        console.log('  🏷️  Type:', data.metadata.type);
        console.log('  🔒 Access Level:', data.visibility?.access_level || 'none');
        console.log('  ✅ Status:', data.visibility?.status || 'none');
        console.log('  🏢 Company:', data.content?.company || 'none');
      } else {
        // Old structure
        console.log('  📝 Title:', data.title);
        console.log('  🏷️  Type:', data.type);
        console.log('  🔒 Access Level: free (default for old)');
        console.log('  ✅ Status:', data.status || 'none');
        console.log('  🏢 Company:', data.company || 'none');
      }
    });
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing resources:', error);
  }
}

// Run the test
testResourceFetch();
