import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const NotFound = () => {
  const navigate = useNavigate()

  const pageTransitionInitial = { opacity: 0, scale: 0.9 }
  const pageTransitionAnimate = { opacity: 1, scale: 1 }
  const pageTransitionConfig = { duration: 0.5 }

  const iconBounceAnimate = { y: [0, -20, 0] }
  const iconBounceTransition = { repeat: Infinity, duration: 2 }

  return (
    <motion.div
      initial={pageTransitionInitial}
      animate={pageTransitionAnimate}
      transition={pageTransitionConfig}
      className="h-full flex items-center justify-center p-6"
    >
      <div className="text-center">
        <motion.div
          animate={iconBounceAnimate}
          transition={iconBounceTransition}
          className="mb-8"
        >
          <ApperIcon name="MessageSquareX" className="w-24 h-24 text-surface-300 mx-auto" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold text-surface-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-surface-900 mb-4">Page Not Found</h2>
          <p className="text-surface-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="primary"
            icon="Home"
            onClick={() => navigate('/')}
          >
            Go to Inbox
          </Button>
          <Button
            variant="outline"
            icon="ArrowLeft"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default NotFound