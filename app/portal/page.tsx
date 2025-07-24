"use client"

import type React from "react"

import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff, BookOpen, Briefcase, Settings, LogOut, Heart } from "lucide-react"

export default function UserPortalPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login/signup
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  if (isLoggedIn) {
    return <UserDashboard onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-freezy-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{isLogin ? "Welcome Back" : "Join Freezy"}</h1>
            <p className="text-gray-600">
              {isLogin ? "Sign in to access your saved resources" : "Create your account to get started"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-freezy-gradient text-white py-3 rounded-lg font-semibold hover:bg-freezy-gradient-hover transition-all duration-300 transform hover:scale-105"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserDashboard({ onLogout }: { onLogout: () => void }) {
  const savedResources = [
    { id: 1, title: "Complete Web Development Course", type: "Course", category: "Programming" },
    { id: 2, title: "Senior Frontend Developer at TechCorp", type: "Job", category: "Technology" },
    { id: 3, title: "Figma Design System Kit", type: "Tool", category: "Design" },
    { id: 4, title: "Data Science with Python", type: "Course", category: "Data Science" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-freezy-gradient rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, John!</h1>
                <p className="text-gray-600">john.doe@example.com</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Saved Resources */}
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Heart className="w-6 h-6 mr-2 text-red-500" />
                  Saved Resources
                </h2>
                <span className="text-gray-500">{savedResources.length} items</span>
              </div>

              <div className="space-y-4">
                {savedResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-freezy-gradient rounded-lg flex items-center justify-center">
                        {resource.type === "Course" && <BookOpen className="w-5 h-5 text-white" />}
                        {resource.type === "Job" && <Briefcase className="w-5 h-5 text-white" />}
                        {resource.type === "Tool" && <Settings className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{resource.title}</h3>
                        <p className="text-sm text-gray-600">
                          {resource.type} • {resource.category}
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Completed "React Fundamentals" course</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Applied to Frontend Developer position</p>
                    <p className="text-sm text-gray-600">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Downloaded Figma Design Kit</p>
                    <p className="text-sm text-gray-600">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-scale-in">
              <h3 className="text-xl font-bold mb-6">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Courses Completed</span>
                    <span className="text-sm text-gray-600">12/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-freezy-gradient h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Job Applications</span>
                    <span className="text-sm text-gray-600">8 this month</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-scale-in">
              <h3 className="text-xl font-bold mb-6">Account Settings</h3>
              <div className="space-y-4">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <span>Edit Profile</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Preferences</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span>Notifications</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
