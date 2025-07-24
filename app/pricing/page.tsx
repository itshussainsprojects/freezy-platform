import Link from "next/link"
import { Check, Star, Zap, Crown } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started with basic resources",
      icon: Star,
      features: [
        "Access to 1,000+ free courses",
        "Basic job listings",
        "5 tool downloads per month",
        "Community support",
        "Email notifications",
      ],
      buttonText: "Get Started Free",
      buttonStyle: "bg-gray-800 text-white hover:bg-gray-700",
      popular: false,
    },
    {
      name: "Pro Plan",
      price: "$10",
      period: "/month",
      description: "Unlock premium features and unlimited access",
      icon: Zap,
      features: [
        "Access to ALL courses & resources",
        "Premium job opportunities",
        "Unlimited tool downloads",
        "Priority support",
        "Advanced search filters",
        "Personalized recommendations",
        "Offline access",
        "Certificate tracking",
      ],
      buttonText: "Start Pro Trial",
      buttonStyle: "bg-freezy-gradient text-white hover:bg-freezy-gradient-hover",
      popular: true,
    },
    {
      name: "Enterprise Plan",
      price: "Custom",
      period: "",
      description: "Tailored solutions for teams and organizations",
      icon: Crown,
      features: [
        "Everything in Pro Plan",
        "Team management dashboard",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced analytics",
        "White-label options",
        "API access",
        "Custom training programs",
      ],
      buttonText: "Contact Sales",
      buttonStyle: "bg-gray-800 text-white hover:bg-gray-700",
      popular: false,
    },
  ]

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
                  <Link
                    href={plan.name === "Enterprise Plan" ? "/contact" : "/portal"}
                    className={`w-full block text-center py-4 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </Link>
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
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
