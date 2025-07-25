'use client'

import Link from "next/link"
import { Check, Star, Zap, Crown } from "lucide-react"
import { useState } from "react"
import UpgradePrompt from "../components/UpgradePrompt"
import { useAuth } from "../contexts/AuthContext"

export default function PricingPage() {
  const { user, userData } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro')

  const plans = [
    {
      name: "Free Plan",
      price: "Free",
      period: "",
      description: "Perfect for getting started with basic resources",
      icon: Star,
      features: [
        "40 total resources",
        "10 job opportunities",
        "15 free courses",
        "15 development tools",
        "Basic filtering",
        "Community support",
      ],
      buttonText: "Get Started Free",
      buttonStyle: "bg-gray-800 text-white hover:bg-gray-700",
      popular: false,
      planKey: 'free'
    },
    {
      name: "Pro Plan",
      price: "200 PKR",
      period: "/month",
      description: "Unlock premium features and more resources",
      icon: Zap,
      features: [
        "200 total resources",
        "80 job opportunities",
        "60 premium courses",
        "60 development tools",
        "Advanced filtering",
        "Priority support",
        "Daily fresh content",
        "JazzCash payment",
      ],
      buttonText: "Upgrade to Pro",
      buttonStyle: "bg-freezy-gradient text-white hover:bg-freezy-gradient-hover",
      popular: true,
      planKey: 'pro'
    },
    {
      name: "Enterprise Plan",
      price: "400 PKR",
      period: "/month",
      description: "Unlimited access for serious professionals",
      icon: Crown,
      features: [
        "Unlimited resources",
        "All job opportunities",
        "All premium courses",
        "All development tools",
        "Premium analytics",
        "Direct admin contact",
        "Custom integrations",
        "WhatsApp support",
      ],
      buttonText: "Upgrade to Enterprise",
      buttonStyle: "bg-gray-800 text-white hover:bg-gray-700",
      popular: false,
      planKey: 'enterprise'
    },
  ]

  const handlePlanSelect = (planKey: string) => {
    if (planKey === 'free') {
      // Redirect to signup for free plan
      window.location.href = '/auth/signup'
    } else {
      // Show upgrade modal for paid plans
      setSelectedPlan(planKey as 'pro' | 'enterprise')
      setShowUpgradeModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your learning and career growth journey. Start free and upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in ${
                  plan.popular ? "ring-2 ring-blue-500 scale-105" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-freezy-gradient text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-freezy-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.planKey)}
                    className={`w-full py-4 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold mb-2">Can I switch plans anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold mb-2">Is there a free trial for Pro Plan?</h3>
              <p className="text-gray-600">
                Yes, we offer a 14-day free trial for the Pro Plan with full access to all features.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept JazzCash payments for Pakistani users. Simple and secure payment process.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold mb-2">How do I get approved after payment?</h3>
              <p className="text-gray-600">
                After payment, send a screenshot via WhatsApp to +92 3225750871. You'll be approved within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradePrompt
          currentPlan={userData?.subscription?.selected_plan || 'free'}
          resourceType="resources"
          onClose={() => setShowUpgradeModal(false)}
          showModal={true}
        />
      )}
    </div>
  )
}
