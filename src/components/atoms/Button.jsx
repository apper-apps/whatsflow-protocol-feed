import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/20 shadow-sm',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/20 shadow-sm',
    outline: 'border border-surface-300 text-surface-700 hover:bg-surface-50 focus:ring-surface/20',
    ghost: 'text-surface-600 hover:bg-surface-100 focus:ring-surface/20',
    danger: 'bg-error text-white hover:bg-error/90 focus:ring-error/20 shadow-sm'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  }

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <ApperIcon 
          name="Loader2" 
          size={iconSizes[size]} 
          className="animate-spin" 
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon name={icon} size={iconSizes[size]} />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon name={icon} size={iconSizes[size]} />
      )}
    </motion.button>
  )
}

export default Button