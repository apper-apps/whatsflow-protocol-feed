import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const ErrorState = ({ 
  title = "Something went wrong",
  message = "We encountered an error while loading the data.",
  onRetry,
  showRetry = true,
  className = ''
}) => {
  const errorStateInitial = { scale: 0.9, opacity: 0 }
  const errorStateAnimate = { scale: 1, opacity: 1 }
  const iconBounceAnimate = { y: [0, -10, 0] }
  const iconBounceTransition = { repeat: Infinity, duration: 3 }

  return (
    <motion.div
      initial={errorStateInitial}
      animate={errorStateAnimate}
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        animate={iconBounceAnimate}
        transition={iconBounceTransition}
      >
        <ApperIcon name="AlertTriangle" className="w-16 h-16 text-error mx-auto mb-4" />
      </motion.div>
      
      <h3 className="text-lg font-medium text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-600 mb-6 max-w-md mx-auto">{message}</p>
      
      {showRetry && onRetry && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="primary"
            icon="RefreshCw"
            onClick={onRetry}
          >
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ErrorState