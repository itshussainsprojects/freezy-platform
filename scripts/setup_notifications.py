#!/usr/bin/env python3
"""
Setup script for email notifications using free services
"""

import requests
import json
import os
from datetime import datetime

class NotificationSetup:
    def __init__(self):
        self.discord_webhook = os.getenv('DISCORD_WEBHOOK')
    
    def test_discord_webhook(self):
        """Test Discord webhook notification"""
        if not self.discord_webhook:
            print("❌ DISCORD_WEBHOOK environment variable not set")
            return False
        
        try:
            test_message = {
                'content': '🧪 **Test Notification from Freezy Platform**\n\n✅ Discord webhook is working correctly!\n⏰ Time: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'username': 'Freezy Test Bot',
                'avatar_url': 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png'
            }
            
            response = requests.post(self.discord_webhook, json=test_message, timeout=10)
            
            if response.status_code == 204:
                print("✅ Discord webhook test successful!")
                return True
            else:
                print(f"❌ Discord webhook test failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Discord webhook test error: {e}")
            return False
    
    def setup_email_notifications(self):
        """Setup email notifications using EmailJS (free)"""
        print("📧 Setting up email notifications...")
        
        # EmailJS setup instructions
        instructions = """
        📧 FREE EMAIL NOTIFICATIONS SETUP:
        
        1. Go to https://www.emailjs.com/
        2. Create a free account (300 emails/month)
        3. Create an email service (Gmail, Outlook, etc.)
        4. Create an email template
        5. Get your:
           - Service ID
           - Template ID  
           - Public Key
        6. Add these to your GitHub secrets:
           - EMAILJS_SERVICE_ID
           - EMAILJS_TEMPLATE_ID
           - EMAILJS_PUBLIC_KEY
        
        ✅ Then users can subscribe to daily updates!
        """
        
        print(instructions)
        return True
    
    def setup_push_notifications(self):
        """Setup push notifications using OneSignal (free)"""
        print("🔔 Setting up push notifications...")
        
        instructions = """
        🔔 FREE PUSH NOTIFICATIONS SETUP:
        
        1. Go to https://onesignal.com/
        2. Create a free account (unlimited notifications)
        3. Create a new app for "Web Push"
        4. Configure your website URL
        5. Get your:
           - App ID
           - REST API Key
        6. Add these to your GitHub secrets:
           - ONESIGNAL_APP_ID
           - ONESIGNAL_REST_API_KEY
        
        ✅ Then add OneSignal SDK to your website!
        """
        
        print(instructions)
        return True
    
    def create_discord_webhook_guide(self):
        """Create guide for Discord webhook setup"""
        guide = """
        🔗 DISCORD WEBHOOK SETUP (FREE):
        
        1. Create a Discord server (or use existing)
        2. Create a channel for notifications (e.g., #freezy-updates)
        3. Go to Channel Settings → Integrations → Webhooks
        4. Click "Create Webhook"
        5. Copy the webhook URL
        6. Add to GitHub secrets as DISCORD_WEBHOOK
        
        ✅ You'll get instant notifications when new resources are added!
        """
        
        print(guide)
        return True

def main():
    """Main setup function"""
    print("=" * 60)
    print("🔔 FREEZY PLATFORM NOTIFICATION SETUP")
    print("=" * 60)
    
    setup = NotificationSetup()
    
    # Test Discord webhook if available
    if os.getenv('DISCORD_WEBHOOK'):
        print("\n🧪 Testing Discord webhook...")
        setup.test_discord_webhook()
    else:
        print("\n🔗 Discord webhook setup guide:")
        setup.create_discord_webhook_guide()
    
    # Show email setup guide
    print("\n" + "="*60)
    setup.setup_email_notifications()
    
    # Show push notification setup guide
    print("\n" + "="*60)
    setup.setup_push_notifications()
    
    print("\n" + "="*60)
    print("✅ NOTIFICATION SETUP COMPLETE!")
    print("📝 Follow the guides above to enable all notification types")
    print("=" * 60)

if __name__ == "__main__":
    main()
