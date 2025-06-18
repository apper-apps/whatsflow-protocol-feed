import { motion } from 'framer-motion'

const SkeletonLoader = ({ count = 1, className = '' }) => {
  const shimmerAnimate = {
    backgroundPosition: ['200% 0', '-200% 0'],
  }
  
  const shimmerTransition = {
    repeat: Infinity,
    duration: 1.5,
    ease: 'linear'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-surface-200 rounded-full flex-shrink-0"></div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <motion.div
                animate={shimmerAnimate}
                transition={shimmerTransition}
                className="h-4 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-3/4 mb-2"
                style={{
                  backgroundSize: '200% 100%'
                }}
              />
              
              {/* Subtitle */}
              <motion.div
                animate={shimmerAnimate}
                transition={shimmerTransition}
                className="h-3 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-1/2 mb-2"
                style={{
                  backgroundSize: '200% 100%'
                }}
              />
              
              {/* Description */}
              <motion.div
                animate={shimmerAnimate}
                transition={shimmerTransition}
                className="h-3 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-full"
                style={{
                  backgroundSize: '200% 100%'
                }}
              />
            </div>
            
            {/* Action */}
            <div className="w-8 h-8 bg-surface-200 rounded flex-shrink-0"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SkeletonLoader