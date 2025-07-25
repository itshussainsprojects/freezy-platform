'use client'

import React from 'react'
import { MessageCircle, HelpCircle, CreditCard, Clock } from 'lucide-react'

interface WhatsAppSupportProps {
  type?: 'payment' | 'support' | 'approval'
  userEmail?: string
  planName?: string
  amount?: string
  className?: string
}

const WhatsAppSupport: React.FC<WhatsAppSupportProps> = ({
  type = 'support',
  userEmail = '',
  planName = '',
  amount = '',
  className = ''
}) => {
  const whatsappNumber = '+923225750871'

  const getMessageTemplate = () => {
    switch (type) {
      case 'payment':
        return `Hi! I've paid ${amount} for ${planName} on Freezy Platform.

Account Email: ${userEmail}
Plan: ${planName}
Amount: ${amount}

Please find payment screenshot attached. Kindly approve my account.

Thank you!`

      case 'approval':
        return `Hi! I need help with my account approval on Freezy Platform.

Account Email: ${userEmail}
Issue: Account pending approval
Plan: ${planName}

Please help me get my account approved.

Thank you!`

      case 'support':
      default:
        return `Hi! I need support with Freezy Platform.

Account Email: ${userEmail}
Issue: [Please describe your issue]

Thank you!`
    }
  }

  const getButtonText = () => {
    switch (type) {
      case 'payment':
        return 'Send Payment Screenshot'
      case 'approval':
        return 'Request Approval'
      case 'support':
      default:
        return 'Contact Support'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4" />
      case 'approval':
        return <Clock className="w-4 h-4" />
      case 'support':
      default:
        return <HelpCircle className="w-4 h-4" />
    }
  }

  const openWhatsApp = () => {
    const message = getMessageTemplate()
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      onClick={openWhatsApp}
      className={`inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      {getIcon()}
      <span>{getButtonText()}</span>
    </button>
  )
}

export default WhatsAppSupport

// Helper function for direct WhatsApp integration
export const openWhatsAppSupport = (type: 'payment' | 'support' | 'approval', options: {
  userEmail?: string
  planName?: string
  amount?: string
} = {}) => {
  const whatsappNumber = '+923225750871'
  
  let message = ''
  
  switch (type) {
    case 'payment':
      message = `Hi! I've paid ${options.amount} for ${options.planName} on Freezy Platform.

Account Email: ${options.userEmail}
Plan: ${options.planName}
Amount: ${options.amount}

Please find payment screenshot attached. Kindly approve my account.

Thank you!`
      break

    case 'approval':
      message = `Hi! I need help with my account approval on Freezy Platform.

Account Email: ${options.userEmail}
Issue: Account pending approval
Plan: ${options.planName}

Please help me get my account approved.

Thank you!`
      break

    case 'support':
    default:
      message = `Hi! I need support with Freezy Platform.

Account Email: ${options.userEmail}
Issue: [Please describe your issue]

Thank you!`
      break
  }
  
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}

// Floating WhatsApp Button Component
export const FloatingWhatsApp: React.FC<{ userEmail?: string }> = ({ userEmail = '' }) => {
  const openSupport = () => {
    openWhatsAppSupport('support', { userEmail })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={openSupport}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 animate-pulse"
        title="Contact Support via WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  )
}
