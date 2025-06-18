import { motion } from 'framer-motion'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const TemplateCard = ({ template, onEdit, onDelete, onUse, ...props }) => {
  const getCategoryVariant = (category) => {
    switch (category?.toLowerCase()) {
      case 'greeting': return 'success'
      case 'orders': return 'primary'
      case 'shipping': return 'info'
      case 'support': return 'warning'
      case 'marketing': return 'secondary'
      default: return 'default'
    }
  }

  const previewContent = (content) => {
    // Replace variables with placeholder text for preview
    let preview = content || ''
    const variables = template?.variables || []
    
    variables.forEach(variable => {
      const placeholder = `[${variable}]`
      preview = preview.replace(new RegExp(`{{${variable}}}`, 'g'), placeholder)
    })
    
    return preview
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
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-surface-900 truncate mb-1">
            {template?.name || 'Untitled Template'}
          </h3>
          <Badge variant={getCategoryVariant(template?.category)} size="sm">
            {template?.category || 'General'}
          </Badge>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            icon="Copy"
            onClick={() => onUse?.(template)}
            className="p-1"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Edit"
            onClick={() => onEdit?.(template)}
            className="p-1"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={() => onDelete?.(template)}
            className="p-1 text-error hover:text-error"
          />
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-3">
        <p className="text-sm text-surface-600 line-clamp-3">
          {previewContent(template?.content)}
        </p>
      </div>

      {/* Variables */}
      {template?.variables && template.variables.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <ApperIcon name="Braces" size={14} className="text-surface-400" />
            <span className="text-xs text-surface-500 font-medium">Variables</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {template.variables.map((variable, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-surface-100 text-surface-700 text-xs rounded font-mono"
              >
                {`{{${variable}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100">
        <div className="flex items-center gap-1 text-xs text-surface-500">
          <ApperIcon name="Type" size={12} />
          {template?.content?.length || 0} characters
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onUse?.(template)}
        >
          Use Template
        </Button>
      </div>
    </motion.div>
  )
}

export default TemplateCard