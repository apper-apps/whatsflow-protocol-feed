import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ConversationList from '@/components/organisms/ConversationList'
import MessageThread from '@/components/organisms/MessageThread'
import { conversationService } from '@/services'
import { toast } from 'react-toastify'

const Inbox = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleStatusChange = async (conversationId, newStatus) => {
    try {
      const updatedConversation = await conversationService.updateStatus(conversationId, newStatus)
      setSelectedConversation(updatedConversation)
      return updatedConversation
    } catch (err) {
      throw new Error('Failed to update conversation status')
    }
  }

  const pageTransitionInitial = { opacity: 0, x: 20 }
  const pageTransitionAnimate = { opacity: 1, x: 0 }
  const pageTransitionConfig = { duration: 0.3 }

  return (
    <motion.div
      initial={pageTransitionInitial}
      animate={pageTransitionAnimate}
      transition={pageTransitionConfig}
      className="h-full flex overflow-hidden"
    >
      {/* Conversation List - Mobile: Full width, Desktop: Fixed width */}
      <div className={`${
        selectedConversation ? 'hidden lg:flex' : 'flex'
      } w-full lg:w-96 flex-shrink-0`}>
        <ConversationList
          selectedConversationId={selectedConversation?.Id}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Message Thread - Mobile: Full width when selected, Desktop: Flex remaining */}
      <div className={`${
        selectedConversation ? 'flex' : 'hidden lg:flex'
      } flex-1`}>
        <MessageThread
          conversation={selectedConversation}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Mobile Back Button */}
      {selectedConversation && (
        <button
          onClick={() => setSelectedConversation(null)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-full shadow-lg border border-surface-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}

export default Inbox