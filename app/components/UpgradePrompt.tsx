'use client'

import React, { useState } from 'react'
import { Crown, Zap, Star, Check, X, Copy, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { updateUserPlan } from '../../firebase/services/userService'

interface UpgradePromptProps {
  currentPlan: string
  resourceType?: string
  onClose?: () => void
  showModal?: boolean
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  currentPlan, 
  resourceType = 'resources',
  onClose,
  showModal = false 
}) => {
  const { user, userData, refreshUserData } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro')
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment' | 'confirmation'>('select')

  const plans = {
    pro: {
      name: 'Pro Plan',
      price: '200 PKR',
      priceNum: 200,
      icon: <Crown className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-600',
      features: [
        'Access to premium resources',
        'Quality job opportunities',
        'Professional courses',
        'Advanced development tools',
        'Enhanced filtering options',
        'Priority support'
      ],
      limits: {
        total: 200,
        jobs: 80,
        courses: 60,
        tools: 60
      }
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: '400 PKR',
      priceNum: 400,
      icon: <Star className="w-6 h-6" />,
      color: 'from-purple-600 to-pink-600',
      features: [
        'Unlimited access to all resources',
        'Exclusive premium job opportunities',
        'Complete course library',
        'Full development toolkit',
        'Advanced analytics & insights',
        'Direct admin support',
        'Custom integrations & features'
      ],
      limits: {
        total: -1,
        jobs: -1,
        courses: -1,
        tools: -1
      }
    }
  }

  const currentLimits = {
    free: { total: 38, jobs: 12, courses: 13, tools: 13 },
    pro: { total: 200, jobs: 80, courses: 60, tools: 60 },
    enterprise: { total: -1, jobs: -1, courses: -1, tools: -1 }
  }

  const handlePlanSelect = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const result = await updateUserPlan(user.uid, { plan: selectedPlan })
      
      if (result.success) {
        setPaymentStep('payment')
      } else {
        alert('Error updating plan. Please try again.')
      }
    } catch (error) {
      console.error('Error selecting plan:', error)
      alert('Error selecting plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyJazzCashNumber = () => {
    navigator.clipboard.writeText('+92 3225750871')
    alert('JazzCash number copied to clipboard!')
  }

  const openWhatsApp = () => {
    const message = `Hi! I've paid ${plans[selectedPlan].price} for ${plans[selectedPlan].name} on Freezy Platform. 
    
Account Email: ${user?.email}
Plan: ${plans[selectedPlan].name}
Amount: ${plans[selectedPlan].price}

Please find payment screenshot attached. Kindly approve my account.

Thank you!`
    
    const whatsappUrl = `https://wa.me/923225750871?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePaymentConfirmation = async () => {
    setPaymentStep('confirmation')
    await refreshUserData()
  }

  if (!showModal && currentPlan !== 'free') return null

  const content = (
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Unlock More {resourceType}</h2>
              <p className="text-blue-100">Choose your plan and get instant access</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {paymentStep === 'select' && (
          <>
            {/* Current Plan Status */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Your Current Plan: Free</h3>
              <p className="text-gray-600">
                You're currently on our free plan with access to basic resources.
                Upgrade to unlock premium job opportunities, advanced courses, and exclusive tools.
              </p>
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Basic Resources
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Community Support
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Regular Updates
                </span>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {Object.entries(plans).map(([planKey, plan]) => (
                <div
                  key={planKey}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPlan === planKey
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(planKey as 'pro' | 'enterprise')}
                >
                  {planKey === 'enterprise' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} text-white mb-4`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">{plan.price}</div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {selectedPlan === planKey && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={handlePlanSelect}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Upgrade to ${plans[selectedPlan].name}`}
            </button>
          </>
        )}

        {paymentStep === 'payment' && (
          <div className="text-center">
            <div className="mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plans[selectedPlan].color} text-white mb-4`}>
                {plans[selectedPlan].icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h3>
              <p className="text-gray-600">You've selected {plans[selectedPlan].name} for {plans[selectedPlan].price}</p>
            </div>

            {/* Payment Instructions */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-lg mb-4">Payment Instructions</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4 bg-white rounded-lg p-4">
                  <span className="font-semibold">JazzCash Number:</span>
                  <span className="font-mono text-lg">+92 3225750871</span>
                  <button
                    onClick={copyJazzCashNumber}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-left space-y-2">
                  <p><strong>Step 1:</strong> Send {plans[selectedPlan].price} to the JazzCash number above</p>
                  <p><strong>Step 2:</strong> Take a screenshot of the payment confirmation</p>
                  <p><strong>Step 3:</strong> Send the screenshot via WhatsApp for verification</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <button
              onClick={openWhatsApp}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-all flex items-center justify-center space-x-2 mb-4"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Send Payment Screenshot via WhatsApp</span>
            </button>

            <button
              onClick={handlePaymentConfirmation}
              className="w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              I've Sent the Payment Screenshot
            </button>
          </div>
        )}

        {paymentStep === 'confirmation' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h3>
              <p className="text-gray-600">Your payment is being verified. You'll get access once approved.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800">
                <strong>Status:</strong> Pending Admin Approval<br/>
                <strong>Expected Time:</strong> Within 24 hours<br/>
                <strong>You'll be notified via:</strong> Email & WhatsApp
              </p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                Continue Browsing
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {content}
      </div>
    )
  }

  return content
}

export default UpgradePrompt
