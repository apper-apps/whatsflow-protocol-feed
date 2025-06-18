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
      case 'closed': return 'default'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return 'AlertCircle'
      case 'ongoing': return 'Clock'
      case 'resolved': return 'CheckCircle'
      case 'closed': return 'Archive'
      default: return 'Circle'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-red-500'
      case 'ongoing': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-400'
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
      className={`p-4 border-b border-surface-200 cursor-pointer transition-all duration-150 relative ${
        isActive 
          ? 'bg-primary/5 border-l-4 border-l-primary' 
          : 'hover:bg-surface-50'
      }`}
      {...props}
    >
      <div className="flex items-start gap-3">
        {/* Status Indicator */}
        <div className="relative">
          <Avatar 
            name={contact?.name} 
            online={conversation?.status === 'ongoing'}
            size="md"
          />
          <div 
            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation?.status)}`}
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-surface-900 truncate">
              {contact?.name || 'Unknown Contact'}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
{conversation?.unreadCount > 0 && (
                <div className="bg-primary text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </div>
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
              <div className="flex items-center gap-1">
                <span className={conversation?.assignedTo ? 'text-surface-700 font-medium' : 'text-surface-400'}>
                  {conversation?.assignedTo || 'Unassigned'}
                </span>
                {conversation?.assignedTo && (
                  <div className={`w-2 h-2 rounded-full ${
                    conversation?.status === 'ongoing' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} title="Agent Status" />
                )}
              </div>
              {(conversation?.transferredAt || conversation?.reassignedAt) && (
                <div className="ml-1 flex items-center gap-1 text-xs text-blue-600">
                  <ApperIcon name="ArrowRightLeft" size={10} />
                  <span title={`${conversation?.transferredAt ? 'Transferred' : 'Reassigned'} at ${
                    conversation?.transferredAt || conversation?.reassignedAt
                  }`}>
                    {conversation?.transferredAt ? 'Transferred' : 'Reassigned'}
                  </span>
                </div>
              )}
              {conversation?.assignmentHistory?.length > 1 && (
                <div className="ml-1 flex items-center gap-1 text-xs text-purple-600" 
                     title={`Assignment history: ${conversation.assignmentHistory.length} changes`}>
                  <ApperIcon name="History" size={10} />
                  <span>{conversation.assignmentHistory.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ConversationCard