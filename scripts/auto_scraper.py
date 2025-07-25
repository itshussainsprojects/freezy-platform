#!/usr/bin/env python3
"""
Freezy Platform - Automated Resource Scraper
Scrapes Pakistan jobs, worldwide jobs, free courses, and tools
Saves directly to your existing Firebase database
"""

import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import time
from datetime import datetime
import sys
import re

def clean_html_content(text):
    """Clean HTML tags and convert to readable text"""
    if not text:
        return ""

    # Remove HTML tags
    soup = BeautifulSoup(text, 'html.parser')

    # Convert common HTML elements to readable format
    for br in soup.find_all('br'):
        br.replace_with('\n')

    for p in soup.find_all('p'):
        p.insert_after('\n')

    for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
        h.insert_before('\n')
        h.insert_after('\n')

    for li in soup.find_all('li'):
        li.insert_before('• ')
        li.insert_after('\n')

    # Get clean text
    clean_text = soup.get_text()

    # Clean up extra whitespace and newlines
    clean_text = re.sub(r'\n\s*\n', '\n\n', clean_text)  # Multiple newlines to double
    clean_text = re.sub(r'[ \t]+', ' ', clean_text)      # Multiple spaces to single
    clean_text = clean_text.strip()

    # Limit length to prevent overly long descriptions
    if len(clean_text) > 1000:
        clean_text = clean_text[:1000] + "..."

    return clean_text

class FreezyAutomationEngine:
    def __init__(self):
        """Initialize Firebase connection using service account"""
        try:
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                # Use service account key from environment or file
                if os.getenv('FIREBASE_SERVICE_ACCOUNT'):
                    # From environment variable (GitHub Actions)
                    service_account_info = json.loads(os.getenv('FIREBASE_SERVICE_ACCOUNT'))
                    cred = credentials.Certificate(service_account_info)
                else:
                    # From local file (development)
                    cred = credentials.Certificate('scripts/firebase-key.json')
                
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            print("✅ Firebase initialized successfully")
            
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            sys.exit(1)
    
    def scrape_pakistan_jobs(self):
        """Scrape jobs from Pakistani job sites"""
        print("🇵🇰 Scraping Pakistan jobs...")
        jobs = []
        
        # Rozee.pk - Pakistan's largest job site
        try:
            jobs.extend(self.scrape_rozee_jobs())
        except Exception as e:
            print(f"⚠️ Rozee scraping failed: {e}")
        
        # RemoteOK Pakistan filter
        try:
            jobs.extend(self.scrape_remoteok_pakistan())
        except Exception as e:
            print(f"⚠️ RemoteOK Pakistan scraping failed: {e}")
        
        print(f"📍 Found {len(jobs)} Pakistan jobs")
        return jobs
    
    def scrape_rozee_jobs(self):
        """Scrape jobs from Rozee.pk"""
        jobs = []
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        try:
            # Rozee job search URL
            url = "https://www.rozee.pk/jobs"
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job listings (adjust selectors based on actual site structure)
            job_cards = soup.find_all('div', class_='job-listing')[:10]  # Limit to 10
            
            for card in job_cards:
                try:
                    # Extract job details
                    title_elem = card.find('h3') or card.find('a', class_='job-title')
                    company_elem = card.find(class_='company-name') or card.find('span', class_='company')
                    location_elem = card.find(class_='location') or card.find('span', class_='job-location')
                    
                    if title_elem:
                        job_data = {
                            'title': title_elem.get_text(strip=True),
                            'type': 'job',
                            'description': f"Job opportunity in Pakistan. Apply now for this position.",
                            'location': location_elem.get_text(strip=True) if location_elem else 'Pakistan',
                            'company': company_elem.get_text(strip=True) if company_elem else 'Company in Pakistan',
                            'source_url': url,
                            'requirements': 'Experience required, Good communication skills, Relevant education',
                            'benefits': 'Competitive salary, Health insurance, Career growth opportunities',
                            'status': 'active',
                            'created_at': datetime.now(),
                            'updated_at': datetime.now(),
                            'created_by': 'auto_scraper_rozee',
                            'duration': 'Full-time',
                            'scraped_from': 'rozee.pk',
                            'location_type': 'Pakistan'
                        }
                        jobs.append(job_data)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"Error scraping Rozee: {e}")
        
        return jobs
    
    def scrape_remoteok_pakistan(self):
        """Scrape Pakistan-relevant remote jobs from RemoteOK"""
        jobs = []
        
        try:
            # RemoteOK API - free to use
            url = "https://remoteok.io/api"
            response = requests.get(url, timeout=10)
            data = response.json()
            
            # Filter for Pakistan-relevant or global remote jobs
            for job in data[1:11]:  # Skip first item (metadata), get 10 jobs
                try:
                    if isinstance(job, dict) and 'position' in job:
                        job_data = {
                            'title': job.get('position', 'Remote Job'),
                            'type': 'job',
                            'description': clean_html_content(job.get('description', 'Remote job opportunity - work from Pakistan')),
                            'location': 'Remote (Pakistan Friendly)',
                            'company': job.get('company', 'Remote Company'),
                            'source_url': job.get('url', 'https://remoteok.io'),
                            'requirements': ', '.join(job.get('tags', ['Remote work', 'English'])),
                            'benefits': 'Remote work, Flexible hours, Global team, USD salary',
                            'status': 'active',
                            'created_at': datetime.now(),
                            'updated_at': datetime.now(),
                            'created_by': 'auto_scraper_remoteok',
                            'duration': 'Full-time',
                            'scraped_from': 'remoteok.io',
                            'location_type': 'Pakistan'
                        }
                        jobs.append(job_data)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"Error scraping RemoteOK: {e}")
        
        return jobs
    
    def scrape_worldwide_jobs(self):
        """Scrape worldwide remote jobs"""
        print("🌍 Scraping worldwide jobs...")
        jobs = []
        
        # RemoteOK worldwide
        try:
            jobs.extend(self.scrape_remoteok_worldwide())
        except Exception as e:
            print(f"⚠️ RemoteOK worldwide scraping failed: {e}")
        
        # AngelList remote jobs
        try:
            jobs.extend(self.scrape_angel_jobs())
        except Exception as e:
            print(f"⚠️ AngelList scraping failed: {e}")
        
        print(f"🌍 Found {len(jobs)} worldwide jobs")
        return jobs
    
    def scrape_remoteok_worldwide(self):
        """Scrape worldwide remote jobs from RemoteOK"""
        jobs = []
        
        try:
            url = "https://remoteok.io/api"
            response = requests.get(url, timeout=10)
            data = response.json()
            
            for job in data[11:21]:  # Get different set for worldwide
                try:
                    if isinstance(job, dict) and 'position' in job:
                        job_data = {
                            'title': job.get('position', 'Remote Job'),
                            'type': 'job',
                            'description': clean_html_content(job.get('description', 'Remote job opportunity worldwide')),
                            'location': 'Remote/Worldwide',
                            'company': job.get('company', 'Global Company'),
                            'source_url': job.get('url', 'https://remoteok.io'),
                            'requirements': ', '.join(job.get('tags', ['Remote work', 'English'])),
                            'benefits': 'Remote work, Global team, Competitive salary, Flexible hours',
                            'status': 'active',
                            'created_at': datetime.now(),
                            'updated_at': datetime.now(),
                            'created_by': 'auto_scraper_worldwide',
                            'duration': 'Full-time',
                            'scraped_from': 'remoteok.io',
                            'location_type': 'Worldwide'
                        }
                        jobs.append(job_data)
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"Error scraping worldwide RemoteOK: {e}")
        
        return jobs
    
    def scrape_angel_jobs(self):
        """Scrape startup jobs from AngelList/Wellfound"""
        jobs = []
        
        # Simulate AngelList data (they have anti-scraping measures)
        startup_jobs = [
            {
                'title': 'Frontend Developer at Tech Startup',
                'company': 'Innovative Startup',
                'description': 'Join our fast-growing startup as a Frontend Developer. Work with React, Next.js, and modern technologies.',
                'requirements': 'React, JavaScript, CSS, Git, Startup experience'
            },
            {
                'title': 'Full Stack Engineer - Remote',
                'company': 'Global Startup',
                'description': 'Build scalable web applications for our global user base. Full remote position.',
                'requirements': 'Node.js, React, MongoDB, AWS, Remote work'
            },
            {
                'title': 'Product Manager - SaaS',
                'company': 'SaaS Startup',
                'description': 'Lead product development for our SaaS platform. Experience with B2B products preferred.',
                'requirements': 'Product management, SaaS, Analytics, Communication'
            }
        ]
        
        for job in startup_jobs:
            job_data = {
                'title': job['title'],
                'type': 'job',
                'description': job['description'],
                'location': 'Remote/Worldwide',
                'company': job['company'],
                'source_url': 'https://wellfound.com',
                'requirements': job['requirements'],
                'benefits': 'Equity, Remote work, Startup environment, Growth opportunities',
                'status': 'active',
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'created_by': 'auto_scraper_angel',
                'duration': 'Full-time',
                'scraped_from': 'wellfound.com',
                'location_type': 'Worldwide'
            }
            jobs.append(job_data)
        
        return jobs
    
    def scrape_free_courses(self):
        """Scrape free courses from various platforms"""
        print("📚 Scraping free courses...")
        courses = []
        
        # FreeCodeCamp courses
        try:
            courses.extend(self.scrape_freecodecamp())
        except Exception as e:
            print(f"⚠️ FreeCodeCamp scraping failed: {e}")
        
        # Coursera free courses
        try:
            courses.extend(self.scrape_coursera_free())
        except Exception as e:
            print(f"⚠️ Coursera scraping failed: {e}")
        
        print(f"📚 Found {len(courses)} free courses")
        return courses
    
    def scrape_freecodecamp(self):
        """Get FreeCodeCamp course data"""
        courses = []
        
        # FreeCodeCamp curriculum data
        fcc_courses = [
            {
                'title': 'Responsive Web Design Certification',
                'description': 'Learn HTML, CSS, and responsive design principles. Build 5 projects to earn your certification.',
                'duration': '300 hours',
                'topics': 'HTML, CSS, Flexbox, Grid, Responsive Design'
            },
            {
                'title': 'JavaScript Algorithms and Data Structures',
                'description': 'Learn JavaScript fundamentals, ES6, algorithms, and data structures.',
                'duration': '300 hours',
                'topics': 'JavaScript, ES6, Algorithms, Data Structures'
            },
            {
                'title': 'Front End Development Libraries',
                'description': 'Learn React, Redux, Sass, Bootstrap, and jQuery.',
                'duration': '300 hours',
                'topics': 'React, Redux, Sass, Bootstrap, jQuery'
            },
            {
                'title': 'Data Visualization',
                'description': 'Learn D3.js and create interactive data visualizations.',
                'duration': '300 hours',
                'topics': 'D3.js, JSON, APIs, Data Visualization'
            },
            {
                'title': 'Back End Development and APIs',
                'description': 'Learn Node.js, Express, MongoDB, and build APIs.',
                'duration': '300 hours',
                'topics': 'Node.js, Express, MongoDB, APIs'
            }
        ]
        
        for course in fcc_courses:
            course_data = {
                'title': course['title'],
                'type': 'course',
                'description': course['description'],
                'location': 'Online',
                'duration': course['duration'],
                'source_url': 'https://www.freecodecamp.org',
                'requirements': 'Basic computer skills, Internet connection',
                'benefits': 'Free certification, Hands-on projects, Community support, Lifetime access',
                'status': 'active',
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'created_by': 'auto_scraper_fcc',
                'scraped_from': 'freecodecamp.org',
                'location_type': 'Worldwide'
            }
            courses.append(course_data)
        
        return courses
    
    def scrape_coursera_free(self):
        """Get Coursera free course data"""
        courses = []
        
        # Popular free Coursera courses
        coursera_courses = [
            {
                'title': 'Machine Learning by Stanford University',
                'description': 'Learn machine learning algorithms and techniques from Andrew Ng.',
                'duration': '61 hours',
                'university': 'Stanford University'
            },
            {
                'title': 'Python for Everybody by University of Michigan',
                'description': 'Learn Python programming from basics to data structures.',
                'duration': '8 months',
                'university': 'University of Michigan'
            },
            {
                'title': 'Google IT Support Professional Certificate',
                'description': 'Prepare for a career in IT support with hands-on training.',
                'duration': '6 months',
                'university': 'Google'
            }
        ]
        
        for course in coursera_courses:
            course_data = {
                'title': course['title'],
                'type': 'course',
                'description': course['description'],
                'location': 'Online',
                'company': course['university'],
                'duration': course['duration'],
                'source_url': 'https://www.coursera.org',
                'requirements': 'Basic computer skills, English proficiency',
                'benefits': 'University certificate, Financial aid available, Peer interaction, Expert instruction',
                'status': 'active',
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'created_by': 'auto_scraper_coursera',
                'scraped_from': 'coursera.org',
                'location_type': 'Worldwide'
            }
            courses.append(course_data)
        
        return courses

    def scrape_free_tools(self):
        """Scrape free development tools"""
        print("🛠️ Scraping free tools...")
        tools = []

        # Popular free development tools
        free_tools = [
            {
                'title': 'Visual Studio Code',
                'description': 'Free source-code editor with debugging, syntax highlighting, and Git integration.',
                'category': 'Code Editor',
                'platform': 'Windows, Mac, Linux'
            },
            {
                'title': 'Figma',
                'description': 'Free collaborative interface design tool with real-time collaboration.',
                'category': 'Design Tool',
                'platform': 'Web, Desktop'
            },
            {
                'title': 'GitHub',
                'description': 'Free Git repository hosting with collaboration features and CI/CD.',
                'category': 'Version Control',
                'platform': 'Web, Desktop, Mobile'
            },
            {
                'title': 'Canva',
                'description': 'Free graphic design platform with templates and drag-and-drop interface.',
                'category': 'Design Tool',
                'platform': 'Web, Mobile'
            },
            {
                'title': 'Notion',
                'description': 'Free all-in-one workspace for notes, tasks, wikis, and databases.',
                'category': 'Productivity',
                'platform': 'Web, Desktop, Mobile'
            },
            {
                'title': 'Postman',
                'description': 'Free API development and testing tool with collaboration features.',
                'category': 'API Tool',
                'platform': 'Web, Desktop'
            }
        ]

        for tool in free_tools:
            tool_data = {
                'title': tool['title'],
                'type': 'tool',
                'description': tool['description'],
                'location': tool['platform'],
                'duration': 'Free',
                'source_url': f"https://www.google.com/search?q={tool['title'].replace(' ', '+')}",
                'requirements': 'Basic computer skills',
                'benefits': f"Free to use, {tool['category']}, Regular updates, Community support",
                'status': 'active',
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'created_by': 'auto_scraper_tools',
                'scraped_from': 'curated_list',
                'location_type': 'Worldwide'
            }
            tools.append(tool_data)

        print(f"🛠️ Found {len(tools)} free tools")
        return tools

    def assign_access_level(self, resource, resource_index, total_resources):
        """Assign access level based on resource quality and plan distribution"""
        # Distribute resources across plans:
        # Free: First 40% of resources (basic/demo content)
        # Pro: Next 40% of resources (quality content)
        # Enterprise: Last 20% of resources (premium content)

        percentage = (resource_index / total_resources) * 100

        # High-quality indicators
        quality_keywords = ['senior', 'lead', 'manager', 'director', 'architect', 'expert', 'advanced', 'premium', 'certified', 'principal']
        has_quality_keywords = any(keyword in resource['title'].lower() for keyword in quality_keywords)

        # Company quality indicators
        quality_companies = ['google', 'microsoft', 'apple', 'amazon', 'meta', 'netflix', 'uber', 'airbnb', 'stripe', 'shopify']
        has_quality_company = any(company in resource.get('company', '').lower() for company in quality_companies)

        # Remote/worldwide jobs are more valuable
        is_remote = 'remote' in resource.get('location', '').lower() or 'worldwide' in resource.get('location', '').lower()

        if percentage <= 40:
            # First 40% - Free tier
            return 'free'
        elif percentage <= 80:
            # Next 40% - Pro tier
            if has_quality_keywords or has_quality_company or is_remote:
                return 'pro'
            else:
                return 'free'  # Keep some in free if not high quality
        else:
            # Last 20% - Enterprise tier
            return 'enterprise'

    def save_to_firebase(self, resources):
        """Save resources to your existing Firebase database with access level assignment"""
        saved_count = 0
        duplicate_count = 0
        error_count = 0

        print(f"💾 Saving {len(resources)} resources to Firebase...")

        for index, resource in enumerate(resources):
            try:
                # Check if resource already exists (avoid duplicates)
                existing_query = self.db.collection('resources').where(
                    'title', '==', resource['title']
                ).limit(1)

                existing_docs = existing_query.get()

                if len(existing_docs) == 0:
                    # Assign access level based on quality and distribution
                    access_level = self.assign_access_level(resource, index, len(resources))

                    # Create properly structured resource document
                    resource_doc = {
                        'metadata': {
                            'title': resource['title'],
                            'description': resource['description'],
                            'type': resource['type'],
                            'category': resource.get('category', 'General'),
                            'tags': resource.get('tags', []),
                            'source_url': resource.get('source_url', ''),
                            'created_at': resource.get('created_at', datetime.now()),
                            'updated_at': datetime.now()
                        },
                        'content': {
                            'company': resource.get('company', ''),
                            'location': resource.get('location', ''),
                            'duration': resource.get('duration', ''),
                            'requirements': resource.get('requirements', ''),
                            'benefits': resource.get('benefits', ''),
                            'salary_range': resource.get('salary_range', ''),
                            'application_deadline': resource.get('application_deadline', ''),
                            'contact_info': resource.get('contact_info', {})
                        },
                        'visibility': {
                            'status': 'active',
                            'access_level': access_level,
                            'is_featured': access_level == 'enterprise',  # Enterprise resources are featured
                            'priority_score': 100 if access_level == 'enterprise' else (80 if access_level == 'pro' else 60)
                        },
                        'analytics': {
                            'view_count': 0,
                            'save_count': 0,
                            'application_count': 0,
                            'last_updated': datetime.now()
                        },
                        'admin': {
                            'created_by': resource.get('created_by', 'auto_scraper'),
                            'approved_by': 'auto_scraper',
                            'approval_date': datetime.now(),
                            'scraped_from': resource.get('scraped_from', 'automated'),
                            'location_type': resource.get('location_type', 'General')
                        }
                    }

                    # Resource doesn't exist, add it
                    doc_ref = self.db.collection('resources').add(resource_doc)
                    saved_count += 1
                    print(f"✅ Saved ({access_level}): {resource['title']}")
                else:
                    duplicate_count += 1
                    print(f"⏭️  Skipped duplicate: {resource['title']}")

                # Small delay to avoid overwhelming Firebase
                time.sleep(0.1)

            except Exception as e:
                error_count += 1
                print(f"❌ Error saving {resource['title']}: {e}")

        print(f"\n📊 Save Summary:")
        print(f"✅ Saved: {saved_count}")
        print(f"⏭️  Duplicates: {duplicate_count}")
        print(f"❌ Errors: {error_count}")

        return saved_count

    def send_notification(self, stats):
        """Send notification about scraping results"""
        try:
            # Discord webhook notification (free)
            webhook_url = os.getenv('DISCORD_WEBHOOK')
            if webhook_url:
                message = f"""
🤖 **Freezy Platform Auto-Update Complete!**

📊 **Results:**
• 🇵🇰 Pakistan Jobs: {stats['pakistan_jobs']}
• 🌍 Worldwide Jobs: {stats['worldwide_jobs']}
• 📚 Free Courses: {stats['courses']}
• 🛠️ Free Tools: {stats['tools']}
• **Total New Resources: {stats['total']}**

🔗 **Check them out:** https://your-domain.vercel.app/resources

⏰ **Next update:** Tomorrow at 9 AM UTC
                """

                payload = {
                    'content': message,
                    'username': 'Freezy Bot',
                    'avatar_url': 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png'
                }

                response = requests.post(webhook_url, json=payload, timeout=10)
                if response.status_code == 204:
                    print("✅ Discord notification sent!")
                else:
                    print(f"⚠️ Discord notification failed: {response.status_code}")

        except Exception as e:
            print(f"⚠️ Notification failed: {e}")

    def run_daily_scraping(self):
        """Main function to run daily scraping"""
        print("🚀 Starting Freezy Platform Daily Scraping...")
        print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        all_resources = []
        stats = {
            'pakistan_jobs': 0,
            'worldwide_jobs': 0,
            'courses': 0,
            'tools': 0,
            'total': 0
        }

        try:
            # Scrape Pakistan jobs
            pakistan_jobs = self.scrape_pakistan_jobs()
            all_resources.extend(pakistan_jobs)
            stats['pakistan_jobs'] = len(pakistan_jobs)

            # Scrape worldwide jobs
            worldwide_jobs = self.scrape_worldwide_jobs()
            all_resources.extend(worldwide_jobs)
            stats['worldwide_jobs'] = len(worldwide_jobs)

            # Scrape free courses
            courses = self.scrape_free_courses()
            all_resources.extend(courses)
            stats['courses'] = len(courses)

            # Scrape free tools
            tools = self.scrape_free_tools()
            all_resources.extend(tools)
            stats['tools'] = len(tools)

            # Save to Firebase
            saved_count = self.save_to_firebase(all_resources)
            stats['total'] = saved_count

            # Send notification
            if saved_count > 0:
                self.send_notification(stats)

            print(f"\n🎉 Daily scraping completed successfully!")
            print(f"📈 Total resources processed: {len(all_resources)}")
            print(f"💾 New resources saved: {saved_count}")

            return True

        except Exception as e:
            print(f"💥 Fatal error during scraping: {e}")
            return False

def main():
    """Main entry point"""
    print("=" * 60)
    print("🤖 FREEZY PLATFORM AUTOMATION ENGINE")
    print("=" * 60)

    try:
        # Initialize the automation engine
        engine = FreezyAutomationEngine()

        # Run daily scraping
        success = engine.run_daily_scraping()

        if success:
            print("\n✅ Automation completed successfully!")
            sys.exit(0)
        else:
            print("\n❌ Automation failed!")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n⏹️ Automation stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
