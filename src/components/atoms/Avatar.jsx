import { motion } from 'framer-motion'

const Avatar = ({ 
  src, 
  alt, 
  name,
  size = 'md',
  className = '',
  online = false,
  ...props 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getBackgroundColor = (name) => {
    if (!name) return 'bg-surface-400'
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center ${
          src ? 'bg-surface-200' : `${getBackgroundColor(name)} text-white`
        }`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-medium">
            {getInitials(name)}
          </span>
        )}
      </motion.div>
      
      {online && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full"
        />
      )}
    </div>
  )
}

export default Avatar