import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contactService, conversationService, messageService, userService } from "@/services";
import MessageBubble from "@/components/molecules/MessageBubble";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import SkeletonLoader from "@/components/atoms/SkeletonLoader";
import ErrorState from "@/components/organisms/ErrorState";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";
const MessageThread = ({ conversation, onStatusChange, onShowLeadDetails, showLeadPanel }) => {
  const [messages, setMessages] = useState([])
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState([])
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

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
        const oldStatus = conversation.status
        await onStatusChange(conversation.Id, newStatus)
        
        // Log status change activity
        await conversationService.addStatusChangeActivity(conversation.Id, {
          type: 'status_change',
          description: `Status changed from ${oldStatus} to ${newStatus}`,
          oldStatus,
          newStatus,
          agent: 'Current Agent' // Would come from auth context in real app
        })
        
        toast.success(`Conversation marked as ${newStatus}`)
      } catch (err) {
        toast.error('Failed to update status')
      }
    }
  }

const handleAssignAgent = async (agentName, isReassignment = false) => {
    try {
      const method = isReassignment ? 'reassignAgent' : 'assignAgent'
      await conversationService[method](conversation.Id, agentName)
      
      // Log assignment activity with full audit trail
      await conversationService.addActivity(conversation.Id, {
        type: isReassignment ? 'reassignment' : 'assignment',
        description: `Conversation ${isReassignment ? 'reassigned' : 'assigned'} to ${agentName}`,
        fromAgent: isReassignment ? conversation.assignedTo : null,
        toAgent: agentName,
        agent: 'Current Agent', // Would come from auth context
        reason: isReassignment ? 'Workload redistribution' : 'Initial assignment',
        metadata: {
          conversationStatus: conversation.status,
          priority: conversation.priority,
          leadScore: conversation.leadScore
        }
      })
      
      toast.success(`Conversation ${isReassignment ? 'reassigned' : 'assigned'} to ${agentName}`)
      
      // Update UI - trigger parent re-fetch
      if (onStatusChange) {
        onStatusChange(conversation.Id, conversation.status)
      }
    } catch (err) {
      toast.error(`Failed to ${isReassignment ? 'reassign' : 'assign'} conversation`)
      console.error('Assignment error:', err)
    }
  }

  const handleTransferChat = async (agentName) => {
    try {
      await conversationService.transferChat(conversation.Id, agentName)
      
      // Log transfer activity with enhanced audit trail
      await conversationService.addActivity(conversation.Id, {
        type: 'transfer',
        description: `Chat transferred to ${agentName}`,
        fromAgent: conversation.assignedTo,
        toAgent: agentName,
        agent: 'Current Agent', // Would come from auth context
        reason: 'Agent transfer requested',
        metadata: {
          transferMethod: 'manual',
          conversationStatus: conversation.status,
          priority: conversation.priority
        }
      })
      
      toast.success(`Chat transferred to ${agentName}`)
      
      // Update UI if needed - would typically trigger parent re-fetch
      if (onStatusChange) {
        onStatusChange(conversation.Id, conversation.status)
      }
    } catch (err) {
      toast.error('Failed to transfer chat')
      console.error('Transfer error:', err)
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
            
            {/* Header Actions */}
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
<AssignmentButton 
                conversation={conversation}
                onAssign={handleAssignAgent}
                onTransfer={handleTransferChat}
              />
              <Button
                variant="ghost"
                size="sm"
                icon="User"
                onClick={onShowLeadDetails}
                className="xl:hidden"
              >
                Lead Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="MoreVertical"
              />
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

{/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 border-t border-surface-200 bg-surface-50">
          <div className="flex items-center gap-2 text-sm text-surface-600">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{contact?.name} is typing...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-surface-200 bg-white">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative bg-surface-100 rounded-lg p-2 flex items-center gap-2">
                <ApperIcon name="File" size={16} className="text-surface-600" />
                <span className="text-sm text-surface-700">{attachment.name}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="text-surface-400 hover:text-surface-600"
                >
                  <ApperIcon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 pb-2 border-b border-surface-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon="Smile"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon="Paperclip"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon="MessageSquareText"
              disabled={sending}
            >
              Templates
            </Button>
            <div className="flex-1"></div>
            <span className="text-xs text-surface-400">
              {newMessage.length}/1000
            </span>
          </div>

          {/* Message Input Row */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                maxLength={1000}
              />
            </div>
            
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

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={(e) => {
            const files = Array.from(e.target.files)
            setAttachments(prev => [...prev, ...files])
          }}
          className="hidden"
        />
      </div>
</div>
  )
}

// Assignment and Transfer Button Component
const AssignmentButton = ({ conversation, onAssign, onTransfer }) => {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('assign') // 'assign', 'reassign', 'transfer'
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [assignmentReason, setAssignmentReason] = useState('')

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      // Using userService to get team members instead of contactService
      const members = await userService.getAll()
      const activeMembers = members.filter(member => 
        member.status === 'active' && 
        ['agent', 'manager', 'admin'].includes(member.role)
      )
      setTeamMembers(activeMembers)
    } catch (err) {
      console.error('Failed to load team members:', err)
      toast.error('Failed to load team members')
    }
  }

  const handleOpenModal = (type) => {
    setModalType(type)
    setShowModal(true)
    setSelectedAgent(null)
    setAssignmentReason('')
  }

  const handleConfirmAction = async () => {
    if (!selectedAgent) {
      toast.error('Please select an agent')
      return
    }

    setLoading(true)
    try {
      if (modalType === 'transfer') {
        await onTransfer(selectedAgent.name)
      } else {
        await onAssign(selectedAgent.name, modalType === 'reassign')
      }
      setShowModal(false)
    } catch (err) {
      // Error handling done in parent
    } finally {
      setLoading(false)
    }
  }

  const getModalTitle = () => {
    switch (modalType) {
      case 'assign': return 'Assign Conversation'
      case 'reassign': return 'Reassign Conversation'
      case 'transfer': return 'Transfer Conversation'
      default: return 'Manage Assignment'
    }
  }

  const getModalDescription = () => {
    switch (modalType) {
      case 'assign': return 'Select an agent to assign this conversation to:'
      case 'reassign': return 'Select a new agent to reassign this conversation to:'
      case 'transfer': return 'Select an agent to transfer this conversation to:'
      default: return 'Select an agent:'
    }
  }

  return (
    <>
      {!conversation.assignedTo ? (
        <Button
          variant="ghost"
          size="sm"
          icon="UserPlus"
          onClick={() => handleOpenModal('assign')}
        >
          Assign
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon="UserCheck"
            onClick={() => handleOpenModal('reassign')}
          >
            Reassign
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon="ArrowRightLeft"
            onClick={() => handleOpenModal('transfer')}
          >
            Transfer
          </Button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">{getModalTitle()}</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowModal(false)}
              />
            </div>

            <p className="text-sm text-surface-600 mb-4">
              {getModalDescription()}
            </p>

            {/* Current Assignment Info */}
            {conversation.assignedTo && (modalType === 'reassign' || modalType === 'transfer') && (
              <div className="bg-surface-50 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <ApperIcon name="User" size={16} className="text-surface-500" />
                  <span className="text-surface-600">Currently assigned to:</span>
                  <span className="font-medium text-surface-900">{conversation.assignedTo}</span>
                </div>
              </div>
            )}

            {/* Agent Selection */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {teamMembers.map((member) => (
                <button
                  key={member.Id}
                  onClick={() => setSelectedAgent(member)}
                  disabled={loading || member.name === conversation.assignedTo}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedAgent?.Id === member.Id
                      ? 'border-primary bg-primary/5'
                      : 'border-surface-200 hover:bg-surface-50'
                  } ${
                    member.name === conversation.assignedTo
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-surface-900">{member.name}</div>
                      <div className="text-sm text-surface-600 capitalize">{member.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      {member.name === conversation.assignedTo && (
                        <span className="text-xs text-blue-600">Current</span>
                      )}
                      {selectedAgent?.Id === member.Id && (
                        <ApperIcon name="Check" size={16} className="text-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Assignment Reason (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Reason (Optional)
              </label>
              <Input
                placeholder={`Reason for ${modalType}...`}
                value={assignmentReason}
                onChange={(e) => setAssignmentReason(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAction}
                className="flex-1"
                disabled={!selectedAgent || loading}
                loading={loading}
              >
                {modalType === 'assign' ? 'Assign' : modalType === 'reassign' ? 'Reassign' : 'Transfer'}
              </Button>
            </div>

            {/* Audit Trail Preview */}
            {selectedAgent && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-800 font-medium mb-1">Audit Trail Preview:</div>
                <div className="text-xs text-blue-700">
                  {modalType === 'assign' 
                    ? `Will assign conversation to ${selectedAgent.name}`
                    : `Will ${modalType} conversation from ${conversation.assignedTo} to ${selectedAgent.name}`
                  }
                  {assignmentReason && ` (Reason: ${assignmentReason})`}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  )
}

export default MessageThread