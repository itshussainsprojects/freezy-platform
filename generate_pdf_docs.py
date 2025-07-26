#!/usr/bin/env python3
"""
Freezy Platform - PDF Documentation Generator
Generates comprehensive PDF documentation from README and system analysis
"""

import os
import sys
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, blue, green, red
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.platypus import Image as RLImage
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib import colors

class FreezyPlatformPDFGenerator:
    def __init__(self):
        self.doc_title = "Freezy Platform - Complete System Documentation"
        self.filename = f"Freezy_Platform_Documentation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
        
    def setup_custom_styles(self):
        """Setup custom styles for the PDF"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            spaceAfter=30,
            textColor=HexColor('#2563eb'),
            alignment=TA_CENTER
        ))
        
        # Heading styles
        self.styles.add(ParagraphStyle(
            name='CustomHeading1',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=12,
            textColor=HexColor('#1e40af'),
            spaceBefore=20
        ))

        self.styles.add(ParagraphStyle(
            name='CustomHeading2',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=10,
            textColor=HexColor('#3b82f6'),
            spaceBefore=15
        ))
        
        # Code style
        self.styles.add(ParagraphStyle(
            name='Code',
            parent=self.styles['Normal'],
            fontSize=9,
            fontName='Courier',
            backgroundColor=HexColor('#f3f4f6'),
            leftIndent=20,
            rightIndent=20,
            spaceAfter=10,
            spaceBefore=10
        ))
        
        # Highlight style
        self.styles.add(ParagraphStyle(
            name='Highlight',
            parent=self.styles['Normal'],
            fontSize=11,
            backgroundColor=HexColor('#dbeafe'),
            leftIndent=15,
            rightIndent=15,
            spaceAfter=8,
            spaceBefore=8
        ))

    def create_cover_page(self, story):
        """Create an attractive cover page"""
        # Main title
        story.append(Spacer(1, 2*inch))
        story.append(Paragraph("🚀 FREEZY PLATFORM", self.styles['CustomTitle']))
        story.append(Spacer(1, 0.5*inch))
        
        # Subtitle
        subtitle_style = ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Normal'],
            fontSize=16,
            alignment=TA_CENTER,
            textColor=HexColor('#6b7280')
        )
        story.append(Paragraph("Complete Job & Learning Resource Platform", subtitle_style))
        story.append(Paragraph("Technical Documentation & Business Guide", subtitle_style))
        story.append(Spacer(1, 1*inch))
        
        # Key features box
        features_data = [
            ["🎯 Feature", "📊 Details"],
            ["Automated Scraping", "Daily fresh content pipeline"],
            ["Tiered Business Model", "Free, Pro (200 PKR), Enterprise (400 PKR)"],
            ["Payment Integration", "JazzCash + WhatsApp verification"],
            ["Admin Panel", "Complete platform management"],
            ["GitHub Actions", "Automated CI/CD workflow"],
            ["Firebase Backend", "Scalable cloud infrastructure"]
        ]
        
        features_table = Table(features_data, colWidths=[2.5*inch, 3.5*inch])
        features_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#e2e8f0'))
        ]))
        
        story.append(features_table)
        story.append(Spacer(1, 1*inch))
        
        # Document info
        doc_info_style = ParagraphStyle(
            name='DocInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=HexColor('#6b7280')
        )
        
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y')}", doc_info_style))
        story.append(Paragraph("Version: 1.0", doc_info_style))
        story.append(Paragraph("Author: Freezy Platform Development Team", doc_info_style))
        story.append(PageBreak())

    def create_table_of_contents(self, story):
        """Create table of contents"""
        story.append(Paragraph("📋 Table of Contents", self.styles['CustomHeading1']))
        story.append(Spacer(1, 20))
        
        toc_data = [
            ["Section", "Page"],
            ["1. Executive Summary", "3"],
            ["2. System Architecture", "5"],
            ["3. Technology Stack", "8"],
            ["4. Business Model", "12"],
            ["5. Installation & Setup", "15"],
            ["6. Auto-Scraper System", "20"],
            ["7. GitHub Actions Workflow", "25"],
            ["8. Admin Panel", "30"],
            ["9. Payment Integration", "35"],
            ["10. Database Structure", "40"],
            ["11. Frontend Components", "45"],
            ["12. Security & Authentication", "50"],
            ["13. Deployment Guide", "55"],
            ["14. Monitoring & Analytics", "60"],
            ["15. Troubleshooting", "65"],
            ["16. API Reference", "70"],
            ["17. Contributing Guidelines", "75"],
            ["18. Appendices", "80"]
        ]
        
        toc_table = Table(toc_data, colWidths=[4*inch, 1*inch])
        toc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#e2e8f0')),
            ('FONTSIZE', (0, 1), (-1, -1), 10)
        ]))
        
        story.append(toc_table)
        story.append(PageBreak())

    def add_executive_summary(self, story):
        """Add executive summary section"""
        story.append(Paragraph("1. 📊 Executive Summary", self.styles['Heading1']))
        
        summary_text = """
        <b>Freezy Platform</b> is a comprehensive job and learning resource platform designed specifically for the Pakistani market with global reach. The platform combines automated content scraping, intelligent resource distribution, and a tiered subscription model to create a sustainable business serving job seekers and learners.
        """
        story.append(Paragraph(summary_text, self.styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Key metrics
        story.append(Paragraph("🎯 Key Metrics & Achievements", self.styles['Heading2']))
        
        metrics_data = [
            ["Metric", "Value", "Impact"],
            ["Total Resources", "88+ (Growing Daily)", "Comprehensive content library"],
            ["Automation", "Daily scraping at 9 AM UTC", "Fresh content without manual work"],
            ["Revenue Model", "200 PKR (Pro), 400 PKR (Enterprise)", "Sustainable business model"],
            ["Technology Stack", "Next.js + Firebase + Python", "Modern, scalable architecture"],
            ["Deployment", "Vercel + GitHub Actions", "Automated CI/CD pipeline"],
            ["Target Market", "Pakistan + Global Remote", "Local focus with global reach"]
        ]
        
        metrics_table = Table(metrics_data, colWidths=[2*inch, 2*inch, 2.5*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#059669')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#ecfdf5')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#10b981')),
            ('FONTSIZE', (0, 1), (-1, -1), 9)
        ]))
        
        story.append(metrics_table)
        story.append(Spacer(1, 20))
        
        # Business value proposition
        story.append(Paragraph("💰 Business Value Proposition", self.styles['Heading2']))
        
        value_props = [
            "<b>For Users:</b> Access to curated job opportunities, courses, and tools with plan-based pricing",
            "<b>For Businesses:</b> Sustainable revenue model with automated content pipeline",
            "<b>For Developers:</b> Modern tech stack with comprehensive documentation and CI/CD",
            "<b>For Admins:</b> Complete control panel for user and content management"
        ]
        
        for prop in value_props:
            story.append(Paragraph(f"• {prop}", self.styles['Normal']))
        
        story.append(PageBreak())

    def add_system_architecture(self, story):
        """Add system architecture section"""
        story.append(Paragraph("2. 🏗️ System Architecture", self.styles['Heading1']))
        
        arch_text = """
        Freezy Platform follows a modern, scalable architecture combining frontend, backend, and automation layers. The system is designed for high availability, performance, and maintainability.
        """
        story.append(Paragraph(arch_text, self.styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Architecture layers
        story.append(Paragraph("🔧 Architecture Layers", self.styles['Heading2']))
        
        layers_data = [
            ["Layer", "Technology", "Purpose", "Key Features"],
            ["Frontend", "Next.js 14 + TypeScript", "User Interface", "SSR, App Router, Responsive Design"],
            ["Backend", "Firebase Suite", "Data & Auth", "Firestore, Auth, Storage, Functions"],
            ["Automation", "Python + GitHub Actions", "Content Pipeline", "Daily scraping, CI/CD, Notifications"],
            ["Integration", "External APIs", "Third-party Services", "JazzCash, WhatsApp, Job Boards"]
        ]
        
        layers_table = Table(layers_data, colWidths=[1.5*inch, 1.8*inch, 1.5*inch, 2*inch])
        layers_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f3e8ff')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#8b5cf6')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ]))
        
        story.append(layers_table)
        story.append(Spacer(1, 20))
        
        # Data flow
        story.append(Paragraph("🔄 Data Flow Architecture", self.styles['Heading2']))
        
        flow_text = """
        <b>1. Content Ingestion:</b> Python scraper → Firebase Firestore<br/>
        <b>2. User Authentication:</b> Firebase Auth → User Management<br/>
        <b>3. Resource Access:</b> Plan-based filtering → Content delivery<br/>
        <b>4. Payment Processing:</b> JazzCash → WhatsApp → Admin approval<br/>
        <b>5. Admin Management:</b> Admin panel → User/Content CRUD operations
        """
        story.append(Paragraph(flow_text, self.styles['Highlight']))
        
        story.append(PageBreak())

    def add_technology_stack(self, story):
        """Add technology stack section"""
        story.append(Paragraph("3. 🛠️ Technology Stack", self.styles['Heading1']))

        # Frontend technologies
        story.append(Paragraph("🎨 Frontend Technologies", self.styles['Heading2']))

        frontend_data = [
            ["Technology", "Version", "Purpose", "Key Benefits"],
            ["Next.js", "14.x", "React Framework", "SSR, App Router, Performance"],
            ["TypeScript", "5.x", "Type Safety", "Better DX, Error Prevention"],
            ["Tailwind CSS", "3.x", "Styling", "Utility-first, Responsive"],
            ["React", "18.x", "UI Library", "Component-based, Virtual DOM"],
            ["Lucide React", "Latest", "Icons", "Consistent iconography"]
        ]

        frontend_table = Table(frontend_data, colWidths=[1.5*inch, 1*inch, 1.5*inch, 2.5*inch])
        frontend_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#dc2626')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#fef2f2')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#ef4444')),
            ('FONTSIZE', (0, 1), (-1, -1), 8)
        ]))

        story.append(frontend_table)
        story.append(Spacer(1, 15))

        # Backend technologies
        story.append(Paragraph("⚡ Backend Technologies", self.styles['Heading2']))

        backend_data = [
            ["Service", "Provider", "Purpose", "Features"],
            ["Firestore", "Firebase", "Database", "NoSQL, Real-time, Scalable"],
            ["Firebase Auth", "Firebase", "Authentication", "Social login, Security"],
            ["Firebase Storage", "Firebase", "File Storage", "CDN, Image optimization"],
            ["Firebase Functions", "Firebase", "Serverless", "Auto-scaling, Event-driven"]
        ]

        backend_table = Table(backend_data, colWidths=[1.5*inch, 1.2*inch, 1.5*inch, 2.3*inch])
        backend_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#ea580c')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#fff7ed')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#f97316')),
            ('FONTSIZE', (0, 1), (-1, -1), 8)
        ]))

        story.append(backend_table)
        story.append(PageBreak())

    def add_business_model(self, story):
        """Add business model section"""
        story.append(Paragraph("4. 💰 Business Model", self.styles['Heading1']))

        # Subscription tiers
        story.append(Paragraph("📊 Subscription Tiers", self.styles['Heading2']))

        tiers_data = [
            ["Plan", "Price (PKR)", "Resources", "Key Features"],
            ["Free", "0", "38", "Basic jobs, courses, tools"],
            ["Pro", "200", "200", "Premium content, remote jobs, priority support"],
            ["Enterprise", "400", "Unlimited", "All resources, exclusive content, direct admin contact"]
        ]

        tiers_table = Table(tiers_data, colWidths=[1.5*inch, 1.2*inch, 1.3*inch, 2.5*inch])
        tiers_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#059669')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BACKGROUND', (0, 1), (0, 1), HexColor('#dcfce7')),  # Free row
            ('BACKGROUND', (0, 2), (0, 2), HexColor('#bfdbfe')),  # Pro row
            ('BACKGROUND', (0, 3), (0, 3), HexColor('#fde68a')),  # Enterprise row
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#10b981')),
            ('FONTSIZE', (0, 1), (-1, -1), 10)
        ]))

        story.append(tiers_table)
        story.append(Spacer(1, 20))

        # Revenue projections
        story.append(Paragraph("📈 Revenue Projections", self.styles['Heading2']))

        revenue_text = """
        <b>Conservative Monthly Estimates:</b><br/>
        • 100 Pro users × 200 PKR = 20,000 PKR/month<br/>
        • 20 Enterprise users × 400 PKR = 8,000 PKR/month<br/>
        • <b>Total Monthly Revenue: 28,000 PKR (~$100 USD)</b><br/><br/>

        <b>Growth Potential:</b><br/>
        • 500 Pro users = 100,000 PKR/month<br/>
        • 100 Enterprise users = 40,000 PKR/month<br/>
        • <b>Total at Scale: 140,000 PKR/month (~$490 USD)</b>
        """
        story.append(Paragraph(revenue_text, self.styles['Highlight']))

        story.append(PageBreak())

    def add_auto_scraper_system(self, story):
        """Add auto-scraper system section"""
        story.append(Paragraph("5. 🤖 Auto-Scraper System", self.styles['Heading1']))

        scraper_text = """
        The auto-scraper is the heart of Freezy Platform, automatically collecting fresh job opportunities, courses, and tools daily. Built in Python with intelligent content processing and Firebase integration.
        """
        story.append(Paragraph(scraper_text, self.styles['Normal']))
        story.append(Spacer(1, 15))

        # Scraper features
        story.append(Paragraph("🔧 Key Features", self.styles['Heading2']))

        features_data = [
            ["Feature", "Description", "Benefit"],
            ["Daily Automation", "Runs every day at 9 AM UTC", "Fresh content without manual work"],
            ["Multi-Source", "Pakistan jobs + worldwide remote", "Comprehensive coverage"],
            ["Smart Filtering", "Quality-based tier assignment", "Relevant content for each plan"],
            ["Duplicate Detection", "Prevents content duplication", "Clean, unique resources"],
            ["Error Handling", "Graceful failure recovery", "Reliable operation"],
            ["Discord Notifications", "Real-time status updates", "Monitoring and alerts"]
        ]

        features_table = Table(features_data, colWidths=[1.8*inch, 2.2*inch, 2.5*inch])
        features_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f3e8ff')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#8b5cf6')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ]))

        story.append(features_table)
        story.append(Spacer(1, 20))

        # Code example
        story.append(Paragraph("💻 Code Architecture", self.styles['Heading2']))

        code_example = """
class AutoScraper:
    def run_daily_scrape(self):
        # 1. Scrape Pakistan jobs
        pakistan_jobs = self.scrape_pakistan_jobs()

        # 2. Scrape worldwide remote jobs
        worldwide_jobs = self.scrape_worldwide_jobs()

        # 3. Scrape free courses
        courses = self.scrape_free_courses()

        # 4. Process and save to Firebase
        self.process_and_save_resources(all_resources)
        """
        story.append(Paragraph(code_example, self.styles['Code']))

        story.append(PageBreak())

    def add_github_actions_workflow(self, story):
        """Add GitHub Actions workflow section"""
        story.append(Paragraph("6. 🔄 GitHub Actions Workflow", self.styles['Heading1']))

        workflow_text = """
        GitHub Actions provides the automation backbone for Freezy Platform. It's a CI/CD platform that runs our scraper daily, completely free and maintenance-free.
        """
        story.append(Paragraph(workflow_text, self.styles['Normal']))
        story.append(Spacer(1, 15))

        # What is GitHub Actions
        story.append(Paragraph("❓ What is GitHub Actions?", self.styles['Heading2']))

        explanation_text = """
        <b>GitHub Actions is NOT MCP (Model Context Protocol)</b> - it's GitHub's built-in automation platform that:

        • Provides free Ubuntu servers (2,000 minutes/month free)
        • Runs scheduled tasks automatically
        • Integrates seamlessly with your repository
        • Handles secrets and environment variables securely
        • Provides detailed logs and monitoring
        """
        story.append(Paragraph(explanation_text, self.styles['Highlight']))
        story.append(Spacer(1, 15))

        # Workflow steps
        story.append(Paragraph("⚙️ Workflow Steps", self.styles['Heading2']))

        steps_data = [
            ["Step", "Action", "Duration", "Purpose"],
            ["1", "Checkout code", "10s", "Get latest repository code"],
            ["2", "Setup Python 3.9", "30s", "Install Python environment"],
            ["3", "Install dependencies", "45s", "Install required packages"],
            ["4", "Load secrets", "5s", "Access Firebase credentials"],
            ["5", "Run scraper", "2-3 min", "Execute auto_scraper.py"],
            ["6", "Save to Firebase", "30s", "Store new resources"],
            ["7", "Send notification", "10s", "Discord alert on completion"]
        ]

        steps_table = Table(steps_data, colWidths=[0.8*inch, 1.5*inch, 1*inch, 3.2*inch])
        steps_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#1f2937')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f9fafb')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#374151')),
            ('FONTSIZE', (0, 1), (-1, -1), 8)
        ]))

        story.append(steps_table)
        story.append(PageBreak())

    def add_installation_guide(self, story):
        """Add installation and setup guide"""
        story.append(Paragraph("7. 📦 Installation & Setup Guide", self.styles['Heading1']))

        # Prerequisites
        story.append(Paragraph("📋 Prerequisites", self.styles['Heading2']))

        prereq_text = """
        Before setting up Freezy Platform, ensure you have:

        • Node.js 18+ installed
        • Python 3.8+ installed
        • Git for version control
        • Firebase CLI (npm install -g firebase-tools)
        • Code editor (VS Code recommended)
        • GitHub account for repository access
        """
        story.append(Paragraph(prereq_text, self.styles['Normal']))
        story.append(Spacer(1, 15))

        # Step-by-step setup
        story.append(Paragraph("🚀 Step-by-Step Setup", self.styles['Heading2']))

        setup_steps = [
            "<b>1. Clone Repository:</b><br/>git clone https://github.com/itshussainsprojects/freezy-platform.git",
            "<b>2. Install Dependencies:</b><br/>npm install && pip install -r requirements.txt",
            "<b>3. Firebase Setup:</b><br/>Create Firebase project, enable Firestore, Auth, Storage",
            "<b>4. Environment Configuration:</b><br/>Copy .env.example to .env.local, add Firebase config",
            "<b>5. GitHub Secrets:</b><br/>Add FIREBASE_SERVICE_ACCOUNT_KEY and DISCORD_WEBHOOK_URL",
            "<b>6. Run Development Server:</b><br/>npm run dev (visit http://localhost:3000)"
        ]

        for step in setup_steps:
            story.append(Paragraph(f"• {step}", self.styles['Normal']))
            story.append(Spacer(1, 8))

        story.append(PageBreak())

    def add_deployment_guide(self, story):
        """Add deployment guide"""
        story.append(Paragraph("8. 🚀 Deployment Guide", self.styles['Heading1']))

        # Vercel deployment
        story.append(Paragraph("🌐 Vercel Deployment (Frontend)", self.styles['Heading2']))

        vercel_text = """
        Vercel provides seamless deployment for Next.js applications with automatic builds on Git push.

        <b>Deployment Steps:</b>
        1. Connect GitHub repository to Vercel
        2. Configure environment variables in Vercel dashboard
        3. Automatic deployment on push to main branch
        4. Custom domain configuration (optional)
        """
        story.append(Paragraph(vercel_text, self.styles['Highlight']))
        story.append(Spacer(1, 15))

        # Firebase deployment
        story.append(Paragraph("🔥 Firebase Deployment (Backend)", self.styles['Heading2']))

        firebase_commands = """
        # Deploy Firestore security rules
        firebase deploy --only firestore:rules

        # Deploy Firebase Functions
        firebase deploy --only functions

        # Deploy Storage rules
        firebase deploy --only storage
        """
        story.append(Paragraph(firebase_commands, self.styles['Code']))

        story.append(PageBreak())

    def add_troubleshooting(self, story):
        """Add troubleshooting section"""
        story.append(Paragraph("9. 🔧 Troubleshooting Guide", self.styles['Heading1']))

        # Common issues
        story.append(Paragraph("🚨 Common Issues & Solutions", self.styles['Heading2']))

        issues_data = [
            ["Issue", "Cause", "Solution"],
            ["Resources not loading", "Firebase config error", "Check .env.local file, verify Firebase setup"],
            ["Auto-scraper not running", "GitHub Actions failure", "Check secrets, review workflow logs"],
            ["Payment verification failing", "WhatsApp integration", "Verify phone number, check admin workflow"],
            ["Build failures", "Dependency conflicts", "Clear cache: rm -rf .next && npm run build"],
            ["Authentication errors", "Firebase Auth config", "Check Firebase Auth settings, verify domain"]
        ]

        issues_table = Table(issues_data, colWidths=[2*inch, 2*inch, 2.5*inch])
        issues_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#dc2626')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#fef2f2')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#ef4444')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ]))

        story.append(issues_table)
        story.append(PageBreak())

    def add_api_reference(self, story):
        """Add API reference section"""
        story.append(Paragraph("10. 📡 API Reference", self.styles['Heading1']))

        # Key API endpoints
        story.append(Paragraph("🔗 Key API Endpoints", self.styles['Heading2']))

        api_data = [
            ["Endpoint", "Method", "Purpose", "Authentication"],
            ["/api/resources", "GET", "Fetch resources with plan filtering", "Required"],
            ["/api/users/profile", "GET/PUT", "User profile management", "Required"],
            ["/api/admin/users", "GET", "Admin user management", "Admin only"],
            ["/api/admin/resources", "POST/PUT/DELETE", "Resource CRUD operations", "Admin only"],
            ["/api/payments/verify", "POST", "Payment verification", "Admin only"]
        ]

        api_table = Table(api_data, colWidths=[1.8*inch, 0.8*inch, 2*inch, 1.9*inch])
        api_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#0891b2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#ecfeff')),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#06b6d4')),
            ('FONTSIZE', (0, 1), (-1, -1), 8)
        ]))

        story.append(api_table)
        story.append(PageBreak())

    def add_appendices(self, story):
        """Add appendices section"""
        story.append(Paragraph("11. 📚 Appendices", self.styles['Heading1']))

        # Contact information
        story.append(Paragraph("📞 Contact Information", self.styles['Heading2']))

        contact_text = """
        <b>Official Website:</b> https://freezyplatform.com<br/>
        <b>GitHub Repository:</b> https://github.com/itshussainsprojects/freezy-platform<br/>
        <b>WhatsApp Support:</b> +92 3225750871<br/>
        <b>Email:</b> admin@freezyplatform.com<br/>
        <b>Business Inquiries:</b> partnerships@freezyplatform.com
        """
        story.append(Paragraph(contact_text, self.styles['Highlight']))
        story.append(Spacer(1, 20))

        # License information
        story.append(Paragraph("📄 License Information", self.styles['Heading2']))

        license_text = """
        This project is licensed under the MIT License. This means you can:

        • Use the software for any purpose
        • Modify and distribute the software
        • Include it in proprietary software
        • Sell copies of the software

        The only requirement is to include the original copyright notice.
        """
        story.append(Paragraph(license_text, self.styles['Normal']))
        story.append(Spacer(1, 20))

        # Acknowledgments
        story.append(Paragraph("🙏 Acknowledgments", self.styles['Heading2']))

        thanks_text = """
        Special thanks to:

        • Firebase Team for excellent backend services
        • Vercel Team for seamless deployment platform
        • GitHub for free Actions and repository hosting
        • Open Source Community for amazing tools and libraries
        • Beta users for valuable feedback and testing
        • Pakistani developer community for support
        """
        story.append(Paragraph(thanks_text, self.styles['Normal']))

    def generate_pdf(self):
        """Generate the complete PDF documentation"""
        print("🚀 Starting PDF generation...")
        
        # Create PDF document
        doc = SimpleDocTemplate(
            self.filename,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Build story (content)
        story = []
        
        # Add all sections
        print("📄 Creating cover page...")
        self.create_cover_page(story)

        print("📋 Creating table of contents...")
        self.create_table_of_contents(story)

        print("📊 Adding executive summary...")
        self.add_executive_summary(story)

        print("🏗️ Adding system architecture...")
        self.add_system_architecture(story)

        print("🛠️ Adding technology stack...")
        self.add_technology_stack(story)

        print("💰 Adding business model...")
        self.add_business_model(story)

        print("🤖 Adding auto-scraper system...")
        self.add_auto_scraper_system(story)

        print("🔄 Adding GitHub Actions workflow...")
        self.add_github_actions_workflow(story)

        print("📦 Adding installation guide...")
        self.add_installation_guide(story)

        print("🚀 Adding deployment guide...")
        self.add_deployment_guide(story)

        print("🔧 Adding troubleshooting...")
        self.add_troubleshooting(story)

        print("📡 Adding API reference...")
        self.add_api_reference(story)

        print("📚 Adding appendices...")
        self.add_appendices(story)
        
        print("📄 Building PDF document...")
        
        # Build PDF
        doc.build(story)
        
        print(f"✅ PDF generated successfully: {self.filename}")
        return self.filename

if __name__ == "__main__":
    try:
        # Install required packages
        print("📦 Installing required packages...")
        os.system("pip install reportlab")
        
        # Generate PDF
        generator = FreezyPlatformPDFGenerator()
        filename = generator.generate_pdf()
        
        print(f"🎉 Documentation PDF created: {filename}")
        print(f"📁 File size: {os.path.getsize(filename) / 1024:.1f} KB")
        
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        sys.exit(1)
