'use client'

import Link from "next/link"
import { BookOpen, Briefcase, Wrench, ArrowRight, Users, Star, Zap, Sparkles, Rocket, Globe } from "lucide-react"
import { useEffect, useState } from "react"
import CSS3DScene from "./components/animations/CSS3DScene"
import ScrollAnimations from "./components/animations/ScrollAnimations"
import Interactive3DText from "./components/animations/Interactive3DText"
import Card3D from "./components/animations/Card3D"

export default function HomePage() {
  return (
    <ScrollAnimations>
      <div className="min-h-screen overflow-hidden relative">
        {/* Amazing CSS 3D Background Animations */}
        <CSS3DScene />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center mesh-gradient pt-4 sm:pt-16 pb-8 sm:pb-0">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-freezy-gradient rounded-full opacity-30 floating-element"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-freezy-gradient-blue rounded-full opacity-40 floating-element" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-freezy-gradient-cyan rounded-full opacity-35 floating-element" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-10 w-18 h-18 bg-freezy-gradient-slate rounded-full opacity-30 floating-element" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 text-white/90 text-xs sm:text-sm font-medium max-w-xs sm:max-w-none mx-auto">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="text-center">🎉 Over 50,000+ Free Resources</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 sm:mb-8 leading-tight px-2">
              <span className="hero-text-glow">Discover</span>
              <br />
              <span className="text-white drop-shadow-2xl">Limitless</span>
              <br />
              <span className="hero-text-glow">Resources</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/80 mb-8 sm:mb-12 max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto font-light leading-relaxed px-4">
              Unlock your potential with our curated collection of free courses, tools, and opportunities.
              <span className="text-gradient-animated font-semibold block sm:inline mt-2 sm:mt-0"> Start your journey today.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center mb-12 sm:mb-16 px-4">
              <Link
                href="/resources"
                className="group relative inline-flex items-center bg-white text-gray-900 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-gray-100 transition-all duration-500 transform hover:scale-105 shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl glow-effect w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <Rocket className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce flex-shrink-0" />
                <span>Get Started Free</span>
                <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>

              <Link
                href="/pricing"
                className="group inline-flex items-center glass-card text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-white/20 transition-all duration-500 transform hover:scale-105 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <Globe className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span>Explore Premium</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 animate-slide-up">
              <span className="text-gradient-animated">Explore</span> Free Resources
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto animate-slide-up leading-relaxed">
              Everything you need to grow personally and professionally,
              <span className="text-gradient font-semibold block sm:inline mt-1 sm:mt-0"> curated just for you</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Free Courses Card */}
            <Card3D
              icon={<BookOpen className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />}
              title="Free Courses"
              description="Access thousands of high-quality courses from top institutions and industry experts, completely free."
              href="/resources?type=courses"
              linkText="Explore Courses"
              gradientClass="bg-freezy-gradient"
              iconBgClass="bg-freezy-gradient"
              linkColorClass="text-blue-600 hover:text-blue-700"
              index={0}
            />

            {/* Job Opportunities Card */}
            <Card3D
              icon={<Briefcase className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />}
              title="Job Opportunities"
              description="Find your dream job with our curated list of opportunities from startups to Fortune 500 companies."
              href="/resources?type=job"
              linkText="Browse Jobs"
              gradientClass="bg-freezy-gradient-blue"
              iconBgClass="bg-freezy-gradient-blue"
              linkColorClass="text-indigo-600 hover:text-indigo-700"
              index={1}
            />

            {/* Free Tools Card */}
            <Card3D
              icon={<Wrench className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />}
              title="Free Tools"
              description="Boost your productivity with our collection of free tools for design, development, and business."
              href="/resources?type=tool"
              linkText="Discover Tools"
              gradientClass="bg-freezy-gradient-cyan"
              iconBgClass="bg-freezy-gradient-cyan"
              linkColorClass="text-cyan-600 hover:text-cyan-700"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-freezy-dark relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-freezy-blue/20 via-transparent to-freezy-cyan/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6">
              Trusted by <span className="text-gradient-animated">Thousands</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto">
              Join our growing community of learners and professionals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div className="group animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-freezy-gradient rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 glow-effect">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-freezy-gradient rounded-2xl sm:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-4 group-hover:scale-105 transition-transform">50K+</h3>
              <p className="text-lg sm:text-xl text-white/80 font-medium">Active Users</p>
              <p className="text-white/60 mt-1 sm:mt-2 text-sm sm:text-base">Growing every day</p>
            </div>

            <div className="group animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-freezy-gradient-blue rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 glow-effect">
                  <Star className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-freezy-gradient-blue rounded-2xl sm:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-4 group-hover:scale-105 transition-transform">10K+</h3>
              <p className="text-lg sm:text-xl text-white/80 font-medium">Free Resources</p>
              <p className="text-white/60 mt-1 sm:mt-2 text-sm sm:text-base">Carefully curated</p>
            </div>

            <div className="group animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-freezy-gradient-cyan rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 glow-effect">
                  <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-freezy-gradient-cyan rounded-2xl sm:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-4 group-hover:scale-105 transition-transform">99%</h3>
              <p className="text-lg sm:text-xl text-white/80 font-medium">Satisfaction Rate</p>
              <p className="text-white/60 mt-1 sm:mt-2 text-sm sm:text-base">Loved by users</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 sm:mb-8 leading-tight px-2">
              Ready to <span className="text-gradient-animated">Transform</span>
              <br />
              Your Future?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-12 max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto leading-relaxed">
              Join thousands of learners and professionals who are already benefiting from our free resources.
              <span className="text-gradient-animated font-semibold block sm:inline mt-2 sm:mt-0"> Your journey starts here.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link
                href="/portal"
                className="group relative inline-flex items-center bg-white text-gray-900 px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl font-bold hover:bg-gray-100 transition-all duration-500 transform hover:scale-105 shadow-xl sm:shadow-2xl glow-effect w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <Sparkles className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-spin flex-shrink-0" />
                <span>Create Free Account</span>
                <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>

              <Link
                href="/pricing"
                className="group inline-flex items-center glass-card text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl font-bold hover:bg-white/20 transition-all duration-500 transform hover:scale-105 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <Star className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span>View Pricing</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-freezy-darker text-white py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-freezy-gradient rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">F</span>
                </div>
                <span className="text-3xl font-bold text-gradient-animated">Freezy</span>
              </div>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Empowering millions with free resources, courses, and opportunities.
                Your gateway to unlimited learning and growth.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/resources" className="text-white/70 hover:text-white transition-colors">Browse Resources</Link></li>
                <li><Link href="/pricing" className="text-white/70 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">Portal</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-white/70 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/50 text-lg">© 2025 Freezy. All rights reserved. Made with ❤️ by Team Hussain  for learners worldwide.</p>
          </div>
        </div>
      </footer>
      </div>
    </ScrollAnimations>
  )
}
