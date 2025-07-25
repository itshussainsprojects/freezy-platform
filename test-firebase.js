const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
try {
  // Try to read the service account file
  const serviceAccount = JSON.parse(fs.readFileSync('g:/Download/freezy-platform-firebase-adminsdk-fbsvc-eaa923b503.json', 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  const db = admin.firestore();
  
  async function testResources() {
    try {
      console.log('🔍 Testing Firebase connection and resources...');
      
      // Get all resources
      const snapshot = await db.collection('resources')
        .orderBy('created_at', 'desc')
        .limit(10)
        .get();
      
      console.log(`📊 Found ${snapshot.size} resources in database`);
      
      if (snapshot.empty) {
        console.log('❌ No resources found! This explains why nothing shows on the website.');
        console.log('💡 You need to run the auto-scraper to add resources.');
        return;
      }
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('\n📋 Resource ID:', doc.id);
        
        // Check structure
        if (data.metadata) {
          console.log('  📝 Title:', data.metadata.title);
          console.log('  🏷️  Type:', data.metadata.type);
          console.log('  🔒 Access Level:', data.visibility?.access_level || 'none');
          console.log('  ✅ Status:', data.visibility?.status || 'none');
          console.log('  🏢 Company:', data.content?.company || 'none');
          console.log('  📅 Created:', data.metadata.created_at?.toDate?.() || 'none');
        } else {
          console.log('  📝 Title:', data.title);
          console.log('  🏷️  Type:', data.type);
          console.log('  🔒 Access Level: free (old structure)');
          console.log('  ✅ Status:', data.status || 'none');
          console.log('  🏢 Company:', data.company || 'none');
          console.log('  📅 Created:', data.created_at?.toDate?.() || 'none');
        }
      });
      
      // Test by type
      console.log('\n🔍 Testing by resource type...');
      
      const types = ['job', 'course', 'tool'];
      for (const type of types) {
        const typeSnapshot = await db.collection('resources')
          .where('metadata.type', '==', type)
          .limit(5)
          .get();
        
        const oldTypeSnapshot = await db.collection('resources')
          .where('type', '==', type)
          .limit(5)
          .get();
        
        const totalCount = typeSnapshot.size + oldTypeSnapshot.size;
        console.log(`  ${type}s: ${totalCount} found`);
      }
      
      console.log('\n✅ Test completed!');
      
    } catch (error) {
      console.error('❌ Error testing resources:', error);
    }
  }
  
  // Run the test
  testResources().then(() => {
    console.log('🏁 Test finished');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  console.log('💡 Make sure the service account file path is correct:');
  console.log('   g:/Download/freezy-platform-firebase-adminsdk-fbsvc-eaa923b503.json');
}
