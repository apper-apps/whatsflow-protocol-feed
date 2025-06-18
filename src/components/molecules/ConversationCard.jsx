import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'

const ConversationCard = ({ 
  conversation, 
  contact, 
  isActive = false, 
  onClick,
  ...props 
}) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'new': return 'error'
      case 'ongoing': return 'warning'
      case 'resolved': return 'success'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return 'AlertCircle'
      case 'ongoing': return 'Clock'
      case 'resolved': return 'CheckCircle'
      default: return 'Circle'
    }
  }

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 border-b border-surface-200 cursor-pointer transition-all duration-150 ${
        isActive 
          ? 'bg-primary/5 border-l-4 border-l-primary' 
          : 'hover:bg-surface-50'
      }`}
      {...props}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar 
          name={contact?.name} 
          online={conversation?.status === 'ongoing'}
          size="md"
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-surface-900 truncate">
              {contact?.name || 'Unknown Contact'}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {conversation?.unreadCount > 0 && (
                <Badge variant="primary" size="sm">
                  {conversation.unreadCount}
                </Badge>
              )}
              <span className="text-xs text-surface-500">
                {formatTime(conversation?.lastMessageTime)}
              </span>
            </div>
          </div>
          
          {/* Last Message */}
          <p className="text-sm text-surface-600 truncate mb-2">
            {conversation?.lastMessage || 'No messages yet'}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant={getStatusVariant(conversation?.status)} 
                size="sm"
                className="flex items-center gap-1"
              >
                <ApperIcon name={getStatusIcon(conversation?.status)} size={12} />
                {conversation?.status || 'unknown'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-surface-500">
              <ApperIcon name="User" size={12} />
              {conversation?.assignedTo || 'Unassigned'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ConversationCard