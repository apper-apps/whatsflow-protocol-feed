import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contactService, conversationService } from "@/services";
import ConversationCard from "@/components/molecules/ConversationCard";
import SearchBar from "@/components/molecules/SearchBar";
import SkeletonLoader from "@/components/atoms/SkeletonLoader";
import ErrorState from "@/components/organisms/ErrorState";
import EmptyState from "@/components/organisms/EmptyState";
import { toast } from "react-toastify";

const ConversationList = ({ selectedConversationId, onSelectConversation }) => {
  const [conversations, setConversations] = useState([])
  const [contacts, setContacts] = useState([])
  const [filteredConversations, setFilteredConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterConversations()
  }, [conversations, contacts, searchQuery])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [conversationsData, contactsData] = await Promise.all([
        conversationService.getAll(),
        contactService.getAll()
      ])
      setConversations(conversationsData)
      setContacts(contactsData)
    } catch (err) {
      setError(err.message || 'Failed to load conversations')
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const filterConversations = () => {
    let filtered = [...conversations]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(conversation => {
        const contact = contacts.find(c => c.Id === conversation.contactId)
        return (
          contact?.name?.toLowerCase().includes(query) ||
          conversation.lastMessage?.toLowerCase().includes(query) ||
          conversation.assignedTo?.toLowerCase().includes(query)
        )
      })
    }

    // Sort by last message time (most recent first)
    filtered.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
    
    setFilteredConversations(filtered)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleConversationClick = (conversation) => {
    onSelectConversation(conversation)
  }

  const staggerItemInitial = { opacity: 0, y: 20 }
  const staggerItemAnimate = { opacity: 1, y: 0 }
  const getStaggerTransition = (index) => ({ delay: index * 0.1 })

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-surface-200">
          <div className="h-10 bg-surface-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={staggerItemInitial}
              animate={staggerItemAnimate}
              transition={getStaggerTransition(i)}
              className="p-4 border-b border-surface-200"
            >
              <SkeletonLoader count={1} />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <ErrorState 
          message={error}
          onRetry={loadData}
        />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <EmptyState 
          title="No conversations yet"
          description="Start a new conversation to see it here"
          actionLabel="New Conversation"
          onAction={() => toast.info('New conversation functionality coming soon')}
        />
      </div>
    )
  }

return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-surface-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900">CRM Inbox</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">
              {Array.isArray(filteredConversations) ? filteredConversations.length : 0}
            </span>
          </div>
        </div>
        
        {/* Search Bar */}
        <SearchBar
          placeholder="Search conversations..."
          onSearch={handleSearch}
          showFilters={false}
        />
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mt-3 bg-surface-100 p-1 rounded-lg">
          <button className="flex-1 py-2 px-3 text-sm font-medium text-white bg-primary rounded-md transition-colors">
            All
          </button>
          <button className="flex-1 py-2 px-3 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
            Unread
          </button>
          <button className="flex-1 py-2 px-3 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
            Assigned
          </button>
          <button className="flex-1 py-2 px-3 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors">
            Closed
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {!Array.isArray(filteredConversations) || filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <EmptyState 
                title="No matches found"
                description="Try adjusting your search or filters"
                actionLabel="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            </div>
          ) : (
            filteredConversations.map((conversation, index) => {
              // Skip if conversation is invalid
              if (!conversation || typeof conversation.Id === 'undefined') {
                return null;
              }

              // Safe contact lookup with null checks
              const contact = Array.isArray(contacts) 
                ? contacts.find(c => c && c.Id === conversation.contactId) 
                : null;
              
              return (
                <motion.div
                  key={`conversation-${conversation.Id}`}
                  initial={staggerItemInitial}
                  animate={staggerItemAnimate}
                  transition={getStaggerTransition(index)}
                >
                  <ConversationCard
                    conversation={conversation}
                    contact={contact}
                    isActive={selectedConversationId === conversation.Id}
                    onClick={() => handleConversationClick(conversation)}
                  />
                </motion.div>
              );
            }).filter(Boolean)
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ConversationList