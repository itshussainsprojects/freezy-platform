#!/usr/bin/env python3
"""
Test script for the Freezy Platform automation system
Run this locally to test before deploying to GitHub Actions
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from auto_scraper import FreezyAutomationEngine
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the scripts directory")
    sys.exit(1)

def test_firebase_connection():
    """Test Firebase connection"""
    print("🔥 Testing Firebase connection...")
    
    try:
        engine = FreezyAutomationEngine()
        print("✅ Firebase connection successful!")
        return True
    except Exception as e:
        print(f"❌ Firebase connection failed: {e}")
        return False

def test_scraping_functions():
    """Test individual scraping functions"""
    print("\n🧪 Testing scraping functions...")
    
    try:
        engine = FreezyAutomationEngine()
        
        # Test Pakistan jobs scraping
        print("🇵🇰 Testing Pakistan jobs scraping...")
        pk_jobs = engine.scrape_pakistan_jobs()
        print(f"✅ Pakistan jobs: {len(pk_jobs)} found")
        
        # Test worldwide jobs scraping
        print("🌍 Testing worldwide jobs scraping...")
        ww_jobs = engine.scrape_worldwide_jobs()
        print(f"✅ Worldwide jobs: {len(ww_jobs)} found")
        
        # Test courses scraping
        print("📚 Testing courses scraping...")
        courses = engine.scrape_free_courses()
        print(f"✅ Free courses: {len(courses)} found")
        
        # Test tools scraping
        print("🛠️ Testing tools scraping...")
        tools = engine.scrape_free_tools()
        print(f"✅ Free tools: {len(tools)} found")
        
        return True
        
    except Exception as e:
        print(f"❌ Scraping test failed: {e}")
        return False

def test_data_structure():
    """Test that scraped data has correct structure"""
    print("\n📋 Testing data structure...")
    
    try:
        engine = FreezyAutomationEngine()
        
        # Get sample data
        sample_jobs = engine.scrape_pakistan_jobs()[:1]
        sample_courses = engine.scrape_free_courses()[:1]
        sample_tools = engine.scrape_free_tools()[:1]
        
        required_fields = [
            'title', 'type', 'description', 'location', 'status',
            'created_at', 'updated_at', 'created_by'
        ]
        
        all_samples = sample_jobs + sample_courses + sample_tools
        
        for sample in all_samples:
            for field in required_fields:
                if field not in sample:
                    print(f"❌ Missing field '{field}' in {sample.get('title', 'Unknown')}")
                    return False
        
        print("✅ Data structure validation passed!")
        return True
        
    except Exception as e:
        print(f"❌ Data structure test failed: {e}")
        return False

def test_firebase_save(dry_run=True):
    """Test Firebase save functionality"""
    print(f"\n💾 Testing Firebase save (dry_run={dry_run})...")
    
    try:
        engine = FreezyAutomationEngine()
        
        # Get a small sample of data
        test_data = [
            {
                'title': f'Test Resource {datetime.now().strftime("%H%M%S")}',
                'type': 'job',
                'description': 'This is a test resource created by the automation test script',
                'location': 'Test Location',
                'company': 'Test Company',
                'source_url': 'https://test.com',
                'requirements': 'Test requirements',
                'benefits': 'Test benefits',
                'status': 'active',
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'created_by': 'test_script',
                'duration': 'Test',
                'scraped_from': 'test',
                'location_type': 'Test'
            }
        ]
        
        if dry_run:
            print("🧪 Dry run - not actually saving to Firebase")
            print(f"✅ Would save {len(test_data)} test resources")
            return True
        else:
            # Actually save to Firebase
            saved_count = engine.save_to_firebase(test_data)
            print(f"✅ Successfully saved {saved_count} test resources to Firebase")
            return True
            
    except Exception as e:
        print(f"❌ Firebase save test failed: {e}")
        return False

def test_notifications():
    """Test notification system"""
    print("\n🔔 Testing notifications...")
    
    try:
        # Test Discord webhook if available
        webhook_url = os.getenv('DISCORD_WEBHOOK')
        if webhook_url:
            import requests
            
            test_stats = {
                'pakistan_jobs': 5,
                'worldwide_jobs': 8,
                'courses': 3,
                'tools': 4,
                'total': 20
            }
            
            engine = FreezyAutomationEngine()
            engine.send_notification(test_stats)
            print("✅ Discord notification test sent!")
        else:
            print("⚠️ DISCORD_WEBHOOK not set - skipping notification test")
        
        return True
        
    except Exception as e:
        print(f"❌ Notification test failed: {e}")
        return False

def run_full_test():
    """Run complete test suite"""
    print("=" * 60)
    print("🧪 FREEZY PLATFORM AUTOMATION TEST SUITE")
    print("=" * 60)
    
    tests = [
        ("Firebase Connection", test_firebase_connection),
        ("Scraping Functions", test_scraping_functions),
        ("Data Structure", test_data_structure),
        ("Firebase Save (Dry Run)", lambda: test_firebase_save(dry_run=True)),
        ("Notifications", test_notifications)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"💥 {test_name} CRASHED: {e}")
    
    print("\n" + "="*60)
    print(f"📊 TEST RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Your automation system is ready!")
        return True
    else:
        print("⚠️ Some tests failed. Please fix the issues before deploying.")
        return False

def main():
    """Main test function"""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--full":
            return run_full_test()
        elif sys.argv[1] == "--firebase":
            return test_firebase_connection()
        elif sys.argv[1] == "--scrape":
            return test_scraping_functions()
        elif sys.argv[1] == "--save":
            return test_firebase_save(dry_run=False)
        else:
            print("Usage: python test_scraper.py [--full|--firebase|--scrape|--save]")
            return False
    else:
        # Run basic tests by default
        print("🧪 Running basic tests... (use --full for complete test suite)")
        firebase_ok = test_firebase_connection()
        scraping_ok = test_scraping_functions()
        
        if firebase_ok and scraping_ok:
            print("\n✅ Basic tests passed! Run with --full for complete testing.")
            return True
        else:
            print("\n❌ Basic tests failed!")
            return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
