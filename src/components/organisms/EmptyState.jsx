import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const EmptyState = ({ 
  title = "No data found",
  description = "There's nothing to show here yet.",
  actionLabel,
  onAction,
  icon = "Package",
  className = ''
}) => {
  const emptyStateInitial = { scale: 0.9, opacity: 0 }
  const emptyStateAnimate = { scale: 1, opacity: 1 }
  const iconBounceAnimate = { y: [0, -10, 0] }
  const iconBounceTransition = { repeat: Infinity, duration: 3 }
  const buttonHover = { scale: 1.05 }
  const buttonTap = { scale: 0.95 }

  return (
    <motion.div
      initial={emptyStateInitial}
      animate={emptyStateAnimate}
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        animate={iconBounceAnimate}
        transition={iconBounceTransition}
      >
        <ApperIcon name={icon} className="w-16 h-16 text-surface-300 mx-auto mb-4" />
      </motion.div>
      
      <h3 className="text-lg font-medium text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-600 mb-6 max-w-md mx-auto">{description}</p>
      
      {actionLabel && onAction && (
        <motion.div
          whileHover={buttonHover}
          whileTap={buttonTap}
        >
          <Button
            variant="primary"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default EmptyState