import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { conversationService, contactService } from '@/services'
import ConversationCard from '@/components/molecules/ConversationCard'
import SearchBar from '@/components/molecules/SearchBar'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import ErrorState from '@/components/organisms/ErrorState'
import EmptyState from '@/components/organisms/EmptyState'
import { toast } from 'react-toastify'

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
    <div className="h-full flex flex-col bg-white border-r border-surface-200">
      {/* Header */}
      <div className="p-4 border-b border-surface-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Conversations</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">{filteredConversations.length}</span>
          </div>
        </div>
        <SearchBar
          placeholder="Search conversations..."
          onSearch={handleSearch}
          showFilters={true}
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredConversations.length === 0 ? (
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
              const contact = contacts.find(c => c.Id === conversation.contactId)
              return (
                <motion.div
                  key={conversation.Id}
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
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ConversationList