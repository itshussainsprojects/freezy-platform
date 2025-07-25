'use client'

import React, { useState } from 'react'
import { ArrowUp, Lock, Zap, Crown, Star } from 'lucide-react'
import UpgradePrompt from './UpgradePrompt'

interface ShowMorePromptProps {
  resourceType: 'jobs' | 'courses' | 'tools'
  currentPlan: string
  currentCount: number
  totalAvailable: number
  nextPlanLimit: number
  nextPlanName: string
  nextPlanPrice: string
}

const ShowMorePrompt: React.FC<ShowMorePromptProps> = ({
  resourceType,
  currentPlan,
  currentCount,
  totalAvailable,
  nextPlanLimit,
  nextPlanName,
  nextPlanPrice
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const getResourceIcon = () => {
    switch (resourceType) {
      case 'jobs': return '💼'
      case 'courses': return '📚'
      case 'tools': return '🛠️'
      default: return '📋'
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro': return <Crown className="w-5 h-5" />
      case 'enterprise': return <Star className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  const additionalResources = nextPlanLimit === -1 
    ? totalAvailable - currentCount 
    : Math.min(nextPlanLimit - currentCount, totalAvailable - currentCount)

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-xl p-8 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-2xl mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {getResourceIcon()} Want More {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}?
          </h3>
          <p className="text-gray-600 mb-6">
            You've viewed {currentCount} out of {totalAvailable} available {resourceType}. 
            Upgrade to access {additionalResources} more!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{currentCount}</div>
            <div className="text-sm text-gray-500">Currently Shown</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">+{additionalResources}</div>
            <div className="text-sm text-gray-500">With {nextPlanName}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{totalAvailable}</div>
            <div className="text-sm text-gray-500">Total Available</div>
          </div>
        </div>

        {/* Upgrade Benefits */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">🚀 Upgrade to {nextPlanName} and Get:</h4>
          <div className="grid md:grid-cols-2 gap-3 text-left">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {nextPlanLimit === -1 ? 'Unlimited' : nextPlanLimit} {resourceType}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Advanced filtering</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Priority support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Daily fresh content</span>
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-800 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
        >
          {getPlanIcon(nextPlanName.toLowerCase())}
          <span>Upgrade to {nextPlanName} - {nextPlanPrice}</span>
          <ArrowUp className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-500 mt-4">
          💳 Pay via JazzCash • ⚡ Instant activation • 🔒 Secure payment
        </p>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradePrompt
          currentPlan={currentPlan}
          resourceType={resourceType}
          onClose={() => setShowUpgradeModal(false)}
          showModal={true}
        />
      )}
    </>
  )
}

export default ShowMorePrompt
