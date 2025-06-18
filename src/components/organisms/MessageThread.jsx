import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { messageService, contactService } from '@/services'
import MessageBubble from '@/components/molecules/MessageBubble'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import ErrorState from '@/components/organisms/ErrorState'
import ApperIcon from '@/components/ApperIcon'
import { toast } from 'react-toastify'

const MessageThread = ({ conversation, onStatusChange }) => {
  const [messages, setMessages] = useState([])
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (conversation) {
      loadMessages()
      loadContact()
    }
  }, [conversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!conversation?.Id) return
    
    setLoading(true)
    setError(null)
    try {
      const messagesData = await messageService.getByConversationId(conversation.Id)
      setMessages(messagesData)
    } catch (err) {
      setError(err.message || 'Failed to load messages')
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const loadContact = async () => {
    if (!conversation?.contactId) return
    
    try {
      const contactData = await contactService.getById(conversation.contactId)
      setContact(contactData)
    } catch (err) {
      console.error('Failed to load contact:', err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const messageData = {
        conversationId: conversation.Id,
        text: messageText,
        isIncoming: false,
        status: 'sent'
      }

      const sentMessage = await messageService.create(messageData)
      setMessages(prev => [...prev, sentMessage])
      
      // Update conversation status to ongoing if it was new
      if (conversation.status === 'new' && onStatusChange) {
        onStatusChange(conversation.Id, 'ongoing')
      }
      
      toast.success('Message sent')
    } catch (err) {
      setNewMessage(messageText) // Restore message on error
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (onStatusChange) {
      try {
        await onStatusChange(conversation.Id, newStatus)
        toast.success(`Conversation marked as ${newStatus}`)
      } catch (err) {
        toast.error('Failed to update status')
      }
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'new': return 'error'
      case 'ongoing': return 'warning'
      case 'resolved': return 'success'
      default: return 'default'
    }
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <ApperIcon name="MessageSquare" size={48} className="text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-600 mb-2">Select a conversation</h3>
          <p className="text-surface-500">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-surface-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-surface-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-3 bg-surface-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Messages Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonLoader key={i} count={1} />
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
          onRetry={loadMessages}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar 
              name={contact?.name} 
              size="md"
              online={conversation.status === 'ongoing'}
            />
            <div>
              <h3 className="font-medium text-surface-900">
                {contact?.name || 'Unknown Contact'}
              </h3>
              <p className="text-sm text-surface-500">
                {contact?.phone || 'No phone number'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(conversation.status)}>
              {conversation.status}
            </Badge>
            
            {/* Status Actions */}
            <div className="flex items-center gap-1 ml-2">
              {conversation.status !== 'resolved' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="CheckCircle"
                  onClick={() => handleStatusChange('resolved')}
                >
                  Resolve
                </Button>
              )}
              {conversation.status === 'resolved' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="RotateCcw"
                  onClick={() => handleStatusChange('ongoing')}
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ApperIcon name="MessageCircle" size={48} className="text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-surface-600 mb-2">No messages yet</h3>
                <p className="text-surface-500">Start the conversation by sending a message</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.Id}
                message={message}
                isIncoming={message.isIncoming}
              />
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-surface-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon="Paperclip"
              disabled={sending}
            />
            <Button
              variant="primary"
              size="sm"
              icon="Send"
              type="submit"
              disabled={!newMessage.trim() || sending}
              loading={sending}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessageThread