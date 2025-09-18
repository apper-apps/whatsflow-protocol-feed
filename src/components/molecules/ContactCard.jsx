import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const ContactCard = ({ contact, onEdit, onDelete, onViewConversations, ...props }) => {
  const formatLastMessage = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Never'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-surface-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={contact?.name} size="lg" />
          <div className="min-w-0">
            <h3 className="font-medium text-surface-900 truncate">
              {contact?.name || 'Unknown Contact'}
            </h3>
            <p className="text-sm text-surface-500 truncate">
              {contact?.phone || 'No phone'}
            </p>
          </div>
        </div>
        
        {/* Actions Menu */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon="MessageSquare"
            onClick={() => onViewConversations?.(contact)}
            className="p-1"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Edit"
            onClick={() => onEdit?.(contact)}
            className="p-1"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={() => onDelete?.(contact)}
            className="p-1 text-error hover:text-error"
          />
        </div>
      </div>

      {/* CRM Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge 
            variant={contact?.leadStatus === 'qualified' ? 'success' : contact?.leadStatus === 'contacted' ? 'warning' : 'secondary'} 
            size="sm"
          >
            {contact?.leadStatus || 'new'}
          </Badge>
          {contact?.priority && (
            <Badge 
              variant={contact.priority === 'high' ? 'error' : contact.priority === 'medium' ? 'warning' : 'secondary'} 
              size="sm"
            >
              {contact.priority} priority
            </Badge>
          )}
        </div>
        {contact?.assignedTo && (
          <div className="flex items-center gap-1 text-xs text-surface-500">
            <ApperIcon name="User" size={12} />
            {contact.assignedTo}
          </div>
        )}
      </div>

      {/* Tags */}
      {contact?.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {contact.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Pipeline Stage */}
      {contact?.pipelineStage && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <ApperIcon name="Target" size={12} />
            <span>Pipeline: {contact.pipelineStage}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {contact?.notes && (
        <div className="mb-3">
          <p className="text-sm text-surface-600 line-clamp-2">
            {contact.notes}
          </p>
        </div>
      )}
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-surface-500 pt-3 border-t border-surface-100">
        <div className="flex items-center gap-1">
          <ApperIcon name="Calendar" size={12} />
          Created {formatLastMessage(contact?.createdAt)}
        </div>
        <div className="flex items-center gap-1">
          <ApperIcon name="MessageSquare" size={12} />
          Last message {formatLastMessage(contact?.lastMessageAt)}
        </div>
      </div>
    </motion.div>
  )
}

export default ContactCard