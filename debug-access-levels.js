// Debug script to check resource access levels
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
try {
  const serviceAccount = JSON.parse(fs.readFileSync('g:/Download/freezy-platform-firebase-adminsdk-fbsvc-eaa923b503.json', 'utf8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
  const db = admin.firestore();
  
  async function debugAccessLevels() {
    try {
      console.log('🔍 DEBUGGING RESOURCE ACCESS LEVELS...\n');
      
      // Get ALL resources
      const snapshot = await db.collection('resources').get();
      
      console.log(`📊 TOTAL RESOURCES: ${snapshot.size}\n`);
      
      let accessLevelCounts = {
        free: 0,
        pro: 0,
        enterprise: 0,
        undefined: 0,
        null: 0
      };
      
      let structureTypes = {
        newStructure: 0,
        oldStructure: 0,
        invalid: 0
      };
      
      console.log('📋 RESOURCE ACCESS LEVEL ANALYSIS:\n');
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        
        // Check structure type
        let accessLevel = 'undefined';
        let structureType = 'invalid';
        
        if (data.metadata && data.metadata.title) {
          // New structure
          structureType = 'newStructure';
          accessLevel = data.visibility?.access_level || 'undefined';
        } else if (data.title) {
          // Old structure
          structureType = 'oldStructure';
          accessLevel = 'free'; // Default for old resources
        }
        
        structureTypes[structureType]++;
        
        if (accessLevelCounts[accessLevel] !== undefined) {
          accessLevelCounts[accessLevel]++;
        } else {
          accessLevelCounts.undefined++;
        }
        
        // Log first 10 resources for detailed analysis
        if (index < 10) {
          console.log(`${index + 1}. ${data.metadata?.title || data.title || 'NO TITLE'}`);
          console.log(`   Structure: ${structureType}`);
          console.log(`   Access Level: ${accessLevel}`);
          console.log(`   Type: ${data.metadata?.type || data.type || 'unknown'}`);
          console.log('');
        }
      });
      
      console.log('📊 SUMMARY:');
      console.log(`Total Resources: ${snapshot.size}`);
      console.log(`New Structure: ${structureTypes.newStructure}`);
      console.log(`Old Structure: ${structureTypes.oldStructure}`);
      console.log(`Invalid: ${structureTypes.invalid}`);
      console.log('');
      console.log('🔒 ACCESS LEVEL DISTRIBUTION:');
      console.log(`Free: ${accessLevelCounts.free}`);
      console.log(`Pro: ${accessLevelCounts.pro}`);
      console.log(`Enterprise: ${accessLevelCounts.enterprise}`);
      console.log(`Undefined: ${accessLevelCounts.undefined}`);
      console.log(`Null: ${accessLevelCounts.null}`);
      
      console.log('\n🎯 EXPECTED FOR FREE PLAN:');
      console.log(`Should show: ${accessLevelCounts.free} resources`);
      console.log(`Currently showing: 27 resources`);
      
      if (accessLevelCounts.free < 38) {
        console.log('\n💡 SOLUTION:');
        console.log(`Need to add ${38 - accessLevelCounts.free} more resources with "free" access level`);
        console.log('OR update existing resources to have "free" access level');
      }
      
    } catch (error) {
      console.error('❌ Error debugging access levels:', error);
    }
  }
  
  // Run the debug
  debugAccessLevels().then(() => {
    console.log('\n🏁 Debug completed');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
}
