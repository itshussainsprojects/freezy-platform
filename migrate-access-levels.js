// Migration script to assign proper access levels to existing resources
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
  
  function assignAccessLevel(resource, index, totalResources) {
    const percentage = (index / totalResources) * 100;
    
    // High-quality indicators
    const qualityKeywords = ['senior', 'lead', 'manager', 'director', 'architect', 'expert', 'advanced', 'premium', 'certified', 'principal'];
    const hasQualityKeywords = qualityKeywords.some(keyword => 
      (resource.title || '').toLowerCase().includes(keyword)
    );
    
    // Company quality indicators
    const qualityCompanies = ['google', 'microsoft', 'apple', 'amazon', 'meta', 'netflix', 'uber', 'airbnb', 'stripe', 'shopify'];
    const hasQualityCompany = qualityCompanies.some(company => 
      (resource.company || '').toLowerCase().includes(company)
    );
    
    // Remote/worldwide jobs are more valuable
    const isRemote = (resource.location || '').toLowerCase().includes('remote') || 
                     (resource.location || '').toLowerCase().includes('worldwide');
    
    // UPDATED DISTRIBUTION: 60% free, 30% pro, 10% enterprise
    if (percentage <= 60) {
      return 'free';
    } else if (percentage <= 90) {
      if (hasQualityKeywords || hasQualityCompany || isRemote) {
        return 'pro';
      } else {
        return 'free';
      }
    } else {
      return 'enterprise';
    }
  }
  
  async function migrateAccessLevels() {
    try {
      console.log('🔄 MIGRATING RESOURCE ACCESS LEVELS...\n');
      
      // Get ALL resources
      const snapshot = await db.collection('resources').get();
      console.log(`📊 Found ${snapshot.size} total resources\n`);
      
      const batch = db.batch();
      let updateCount = 0;
      let skipCount = 0;
      
      const allResources = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allResources.push({
          id: doc.id,
          ref: doc.ref,
          title: data.metadata?.title || data.title || 'Untitled',
          company: data.content?.company || data.company || '',
          location: data.content?.location || data.location || '',
          type: data.metadata?.type || data.type || 'job',
          hasAccessLevel: !!(data.visibility?.access_level)
        });
      });
      
      // Sort by creation date or title for consistent assignment
      allResources.sort((a, b) => a.title.localeCompare(b.title));
      
      console.log('📋 Processing resources...\n');
      
      allResources.forEach((resource, index) => {
        if (resource.hasAccessLevel) {
          console.log(`⏭️  Skipping ${resource.title} (already has access level)`);
          skipCount++;
          return;
        }
        
        const accessLevel = assignAccessLevel(resource, index, allResources.length);
        
        // Update the resource with proper structure
        const updateData = {
          'visibility.access_level': accessLevel,
          'visibility.status': 'active',
          'visibility.is_featured': accessLevel === 'enterprise',
          'visibility.priority_score': accessLevel === 'enterprise' ? 100 : 
                                      accessLevel === 'pro' ? 80 : 60
        };
        
        batch.update(resource.ref, updateData);
        updateCount++;
        
        console.log(`✅ ${resource.title} → ${accessLevel} plan`);
      });
      
      if (updateCount > 0) {
        console.log(`\n💾 Committing ${updateCount} updates...`);
        await batch.commit();
        console.log('✅ Migration completed successfully!');
      } else {
        console.log('\n✅ No updates needed - all resources already have access levels');
      }
      
      console.log(`\n📊 SUMMARY:`);
      console.log(`Updated: ${updateCount}`);
      console.log(`Skipped: ${skipCount}`);
      console.log(`Total: ${allResources.length}`);
      
      // Show expected distribution
      const freeCount = Math.ceil(allResources.length * 0.6);
      const proCount = Math.ceil(allResources.length * 0.3);
      const enterpriseCount = allResources.length - freeCount - proCount;
      
      console.log(`\n🎯 EXPECTED DISTRIBUTION:`);
      console.log(`Free: ~${freeCount} resources`);
      console.log(`Pro: ~${proCount} resources`);
      console.log(`Enterprise: ~${enterpriseCount} resources`);
      
    } catch (error) {
      console.error('❌ Error migrating access levels:', error);
    }
  }
  
  // Run the migration
  migrateAccessLevels().then(() => {
    console.log('\n🏁 Migration completed');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
}
