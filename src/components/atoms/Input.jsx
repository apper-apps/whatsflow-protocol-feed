import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  rightIcon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const hasValue = value && value.length > 0
  const hasError = error && error.length > 0

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      <AnimatePresence>
        {label && (
          <motion.label
            initial={{ y: 0 }}
            animate={{
              y: focused || hasValue ? -20 : 0,
              scale: focused || hasValue ? 0.85 : 1,
              color: hasError ? '#FF4444' : focused ? '#25D366' : '#64748b'
            }}
            className={`absolute left-3 top-3 transition-all duration-200 pointer-events-none origin-left font-medium ${
              focused || hasValue ? 'bg-white px-1' : ''
            }`}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </motion.label>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
            <ApperIcon name={icon} size={16} />
          </div>
        )}

        {/* Input Field */}
        <input
          type={inputType}
          placeholder={focused ? placeholder : ''}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 focus:outline-none ${
            icon ? 'pl-10' : ''
          } ${
            (rightIcon || type === 'password') ? 'pr-10' : ''
          } ${
            hasError
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : focused
              ? 'border-primary focus:ring-2 focus:ring-primary/20'
              : 'border-surface-300 hover:border-surface-400'
          } ${
            disabled
              ? 'bg-surface-50 text-surface-500 cursor-not-allowed'
              : 'bg-white'
          }`}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {(rightIcon || type === 'password') && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {type === 'password' ? (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <ApperIcon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            ) : (
              <div className="text-surface-400">
                <ApperIcon name={rightIcon} size={16} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-error flex items-center gap-1"
          >
            <ApperIcon name="AlertCircle" size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Input