import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contactService, conversationService, messageService, userService } from "@/services";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import SkeletonLoader from "@/components/atoms/SkeletonLoader";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Avatar from "@/components/atoms/Avatar";
import ErrorState from "@/components/organisms/ErrorState";
import Templates from "@/components/pages/Templates";
import MessageBubble from "@/components/molecules/MessageBubble";
import { create, getAll, getById } from "@/services/api/chatbotFlowService";
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
<Badge 
              variant={getStatusVariant(conversation.status)} 
              className={`px-4 py-1.5 text-xs font-bold shadow-sm ${
                conversation.status === 'resolved' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : conversation.status === 'ongoing'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
            >
              {conversation.status.toUpperCase()}
            </Badge>
            
            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Status Actions */}
              <div className="flex items-center gap-2">
                {conversation.status !== 'resolved' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="CheckCircle"
                    onClick={() => handleStatusChange('resolved')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 font-semibold border border-transparent hover:border-green-200 transition-all"
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
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold border border-transparent hover:border-blue-200 transition-all"
                  >
                    Reopen
                  </Button>
                )}
              </div>

              {/* Separator */}
              <div className="w-px h-8 bg-surface-300"></div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="User"
                  onClick={onShowLeadDetails}
                  className="xl:hidden text-surface-600 hover:text-surface-900 hover:bg-surface-100 font-semibold border border-transparent hover:border-surface-300 transition-all"
                >
                  Lead Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="MoreVertical"
                  className="text-surface-600 hover:text-surface-900 hover:bg-surface-100 border border-transparent hover:border-surface-300 transition-all"
                />
              </div>
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
      <div className="border-t border-surface-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              rows="1"
              className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon="Paperclip"
              className="text-surface-600 hover:text-surface-900"
              onClick={() => fileInputRef.current?.click()}
            />
            <Button
              variant="ghost" 
              size="sm"
              icon="Smile"
              className="text-surface-600 hover:text-surface-900"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon="Send"
              disabled={!newMessage.trim() || sending}
              className="px-4"
            >
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </form>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            // Handle file attachments
            const files = Array.from(e.target.files || [])
            setAttachments(prev => [...prev, ...files])
          }}
/>

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
      </div>
    </div>
  )
}

// Assignment Button Component
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
          className="font-semibold border border-transparent hover:border-surface-300 transition-all"
        >
          Assign
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon="UserCheck"
            onClick={() => handleOpenModal('reassign')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold border border-transparent hover:border-blue-200 transition-all"
          >
            Reassign
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon="ArrowRightLeft"
            onClick={() => handleOpenModal('transfer')}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-semibold border border-transparent hover:border-orange-200 transition-all"
          >
            Transfer
          </Button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-surface-200 bg-gradient-to-r from-surface-50 to-white">
              <div>
                <h3 className="text-2xl font-bold text-surface-900">{getModalTitle()}</h3>
                <p className="text-sm text-surface-600 mt-1.5">{getModalDescription()}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowModal(false)}
                className="text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-full"
              />
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Current Assignment Info */}
              {conversation.assignedTo && (modalType === 'reassign' || modalType === 'transfer') && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center shadow-sm">
                      <ApperIcon name="User" size={18} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Currently Assigned</p>
                      <p className="text-sm text-blue-700 font-medium">{conversation.assignedTo}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Member Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-surface-900 mb-4">
                  Select Team Member
                </label>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {teamMembers.map((member) => (
                    <button
                      key={member.Id}
                      onClick={() => setSelectedAgent(member)}
                      disabled={loading || member.name === conversation.assignedTo}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all transform ${
                        selectedAgent?.Id === member.Id
                          ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-md scale-105'
                          : 'border-surface-200 hover:border-surface-400 hover:bg-surface-50 hover:shadow-sm'
                      } ${
                        member.name === conversation.assignedTo
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full shadow-sm ${
                            member.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`} />
                          <div>
                            <div className="font-bold text-surface-900">{member.name}</div>
                            <div className="text-sm text-surface-600 capitalize font-medium">{member.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.name === conversation.assignedTo && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold shadow-sm">Current</span>
                          )}
                          {selectedAgent?.Id === member.Id && (
                            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                              <ApperIcon name="Check" size={16} className="text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignment Reason */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-surface-900 mb-2">
                  Reason (Optional)
                </label>
                <Input
                  placeholder={`Add a reason for ${modalType}...`}
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value)}
                  disabled={loading}
                  className="w-full border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Preview Section */}
              {selectedAgent && (
                <div className="mb-6 p-4 bg-gradient-to-r from-surface-50 to-surface-100 rounded-xl border-2 border-surface-300 shadow-sm">
                  <div className="text-sm font-bold text-surface-900 mb-2 flex items-center gap-2">
                    <ApperIcon name="Eye" size={16} className="text-primary" />
                    Action Preview
                  </div>
                  <div className="text-sm text-surface-700 font-medium">
                    {modalType === 'assign' 
                      ? `Will assign conversation to ${selectedAgent.name}`
                      : `Will ${modalType} conversation from ${conversation.assignedTo} to ${selectedAgent.name}`
                    }
                    {assignmentReason && (
                      <span className="block mt-2 text-surface-600 italic bg-white p-2 rounded-lg border border-surface-200">
                        Reason: {assignmentReason}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t-2 border-surface-200 bg-gradient-to-r from-surface-50 to-white rounded-b-2xl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
                className="flex-1 font-semibold border-2 hover:bg-surface-100 transition-all"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAction}
                className="flex-1 font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={!selectedAgent || loading}
                loading={loading}
              >
                {modalType === 'assign' ? 'Assign' : modalType === 'reassign' ? 'Reassign' : 'Transfer'}
              </Button>
            </div>
          </motion.div>
        </div>
)}
    </>
  )
}

export default MessageThread