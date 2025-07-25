// Debug script to check why only 21 resources show instead of 88
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
  
  async function debugResources() {
    try {
      console.log('🔍 DEBUGGING RESOURCE VISIBILITY ISSUE...\n');
      
      // Get ALL resources (same as admin panel)
      const snapshot = await db.collection('resources')
        .orderBy('created_at', 'desc')
        .get();
      
      console.log(`📊 TOTAL RESOURCES IN DATABASE: ${snapshot.size}\n`);
      
      let newStructureCount = 0;
      let oldStructureCount = 0;
      let activeCount = 0;
      let inactiveCount = 0;
      let jobCount = 0;
      let courseCount = 0;
      let toolCount = 0;
      let accessLevels = { free: 0, pro: 0, enterprise: 0, undefined: 0 };
      
      console.log('📋 ANALYZING EACH RESOURCE:\n');
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        
        // Check structure type
        const isNewStructure = data.metadata && data.metadata.title;
        if (isNewStructure) {
          newStructureCount++;
        } else {
          oldStructureCount++;
        }
        
        // Get normalized data
        let title, type, status, accessLevel;
        
        if (isNewStructure) {
          title = data.metadata.title;
          type = data.metadata.type;
          status = data.visibility?.status || data.status || 'unknown';
          accessLevel = data.visibility?.access_level || 'undefined';
        } else {
          title = data.title;
          type = data.type;
          status = data.status || 'unknown';
          accessLevel = 'free'; // Default for old
        }
        
        // Count by status
        if (status === 'active') {
          activeCount++;
        } else {
          inactiveCount++;
        }
        
        // Count by type
        if (type === 'job') jobCount++;
        else if (type === 'course') courseCount++;
        else if (type === 'tool') toolCount++;
        
        // Count by access level
        if (accessLevels[accessLevel] !== undefined) {
          accessLevels[accessLevel]++;
        } else {
          accessLevels.undefined++;
        }
        
        // Log first 10 resources for detailed analysis
        if (index < 10) {
          console.log(`${index + 1}. ${title}`);
          console.log(`   Structure: ${isNewStructure ? 'NEW' : 'OLD'}`);
          console.log(`   Type: ${type}`);
          console.log(`   Status: ${status}`);
          console.log(`   Access Level: ${accessLevel}`);
          console.log(`   Created: ${data.created_at?.toDate?.() || data.metadata?.created_at?.toDate?.() || 'unknown'}`);
          console.log('');
        }
      });
      
      console.log('📊 SUMMARY STATISTICS:');
      console.log(`Total Resources: ${snapshot.size}`);
      console.log(`New Structure: ${newStructureCount}`);
      console.log(`Old Structure: ${oldStructureCount}`);
      console.log(`Active: ${activeCount}`);
      console.log(`Inactive: ${inactiveCount}`);
      console.log(`Jobs: ${jobCount}`);
      console.log(`Courses: ${courseCount}`);
      console.log(`Tools: ${toolCount}`);
      console.log(`Access Levels:`, accessLevels);
      
      console.log('\n🔍 TESTING PLAN-BASED FILTERING:');
      
      // Test free plan filtering
      let freeResources = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Same logic as getResourcesWithPlanLimits
        let normalizedResource = null;
        
        if (data.metadata && data.metadata.title) {
          normalizedResource = {
            id: doc.id,
            title: data.metadata.title,
            type: data.metadata.type || 'job',
            status: data.visibility?.status || data.status || 'active',
            access_level: data.visibility?.access_level || 'free'
          };
        } else if (data.title) {
          normalizedResource = {
            id: doc.id,
            title: data.title,
            type: data.type || 'job',
            status: data.status || 'active',
            access_level: 'free'
          };
        }
        
        if (normalizedResource) {
          // Only include active resources
          if (!normalizedResource.status || normalizedResource.status === 'active') {
            freeResources.push(normalizedResource);
          }
        }
      });
      
      console.log(`\n✅ RESOURCES THAT PASS FILTERING: ${freeResources.length}`);
      
      // Separate by type
      const jobs = freeResources.filter(r => r.type === 'job');
      const courses = freeResources.filter(r => r.type === 'course');
      const tools = freeResources.filter(r => r.type === 'tool');
      
      console.log(`Jobs: ${jobs.length}`);
      console.log(`Courses: ${courses.length}`);
      console.log(`Tools: ${tools.length}`);
      
      // Apply free plan limits (10 jobs, 15 courses, 15 tools)
      const limitedJobs = jobs.slice(0, 10);
      const limitedCourses = courses.slice(0, 15);
      const limitedTools = tools.slice(0, 15);
      
      const totalShown = limitedJobs.length + limitedCourses.length + limitedTools.length;
      
      console.log(`\n🎯 FREE PLAN RESULT:`);
      console.log(`Jobs shown: ${limitedJobs.length}/10`);
      console.log(`Courses shown: ${limitedCourses.length}/15`);
      console.log(`Tools shown: ${limitedTools.length}/15`);
      console.log(`TOTAL SHOWN: ${totalShown}`);
      
      if (totalShown === 21) {
        console.log('\n✅ FOUND THE ISSUE: Only showing free plan limits!');
        console.log('💡 SOLUTION: Check if user plan is being detected correctly');
      }
      
    } catch (error) {
      console.error('❌ Error debugging resources:', error);
    }
  }
  
  // Run the debug
  debugResources().then(() => {
    console.log('\n🏁 Debug completed');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  console.log('💡 Make sure the service account file path is correct');
}
