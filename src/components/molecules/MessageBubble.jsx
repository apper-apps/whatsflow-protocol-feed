import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'

const MessageBubble = ({ message, isIncoming = true, ...props }) => {
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm')
    } catch {
      return ''
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return 'Check'
      case 'delivered': return 'CheckCheck'
      case 'read': return 'CheckCheck'
      default: return 'Clock'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isIncoming ? 'justify-start' : 'justify-end'} mb-4`}
      {...props}
    >
      <div className={`max-w-xs lg:max-w-md ${isIncoming ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isIncoming
              ? 'bg-white border border-surface-200'
              : 'bg-primary text-white'
          }`}
        >
          {/* Media */}
          {message?.mediaUrl && (
            <div className="mb-2">
              <img
                src={message.mediaUrl}
                alt="Media"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          {/* Text */}
          {message?.text && (
            <p className={`text-sm break-words ${
              isIncoming ? 'text-surface-900' : 'text-white'
            }`}>
              {message.text}
            </p>
          )}
          
          {/* Footer */}
          <div className={`flex items-center justify-end gap-1 mt-1 ${
            isIncoming ? 'text-surface-500' : 'text-white/70'
          }`}>
            <span className="text-xs">
              {formatTime(message?.timestamp)}
            </span>
            {!isIncoming && (
              <ApperIcon 
                name={getStatusIcon(message?.status)} 
                size={12}
                className={message?.status === 'read' ? 'text-blue-300' : ''}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble