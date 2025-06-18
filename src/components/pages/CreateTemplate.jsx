import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { templateService } from '@/services'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import { toast } from 'react-toastify'

const CreateTemplate = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'General',
    type: 'text',
    mediaUrl: '',
    mediaType: '',
    buttonText: '',
    buttonUrl: '',
    location: {
      latitude: '',
      longitude: '',
      name: '',
      address: ''
    },
    contact: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      organization: ''
    }
  })
  const [extractedVariables, setExtractedVariables] = useState([])

  const templateTypes = [
    { value: 'text', label: 'Text Message', icon: 'Type', description: 'Simple text with variables' },
    { value: 'media', label: 'Media Message', icon: 'Image', description: 'Image, video, or document with caption' },
    { value: 'interactive', label: 'Interactive Message', icon: 'MousePointer', description: 'Message with buttons or quick replies' },
    { value: 'location', label: 'Location Message', icon: 'MapPin', description: 'Share location coordinates' },
    { value: 'contact', label: 'Contact Message', icon: 'User', description: 'Share contact information' }
  ]

  const categories = [
    'General', 'Greeting', 'Orders', 'Shipping', 'Support', 'Marketing', 
    'Notifications', 'Reminders', 'Confirmations', 'Updates'
  ]

  const mediaTypes = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document' },
    { value: 'audio', label: 'Audio' }
  ]

  // Extract variables from content
  useEffect(() => {
    const variableRegex = /\{\{([^}]+)\}\}/g
    const matches = [...formData.content.matchAll(variableRegex)]
    const variables = [...new Set(matches.map(match => match[1].trim()))]
    setExtractedVariables(variables)
  }, [formData.content])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return false
    }

    if (!formData.content.trim()) {
      toast.error('Template content is required')
      return false
    }

    if (formData.type === 'media' && !formData.mediaUrl.trim()) {
      toast.error('Media URL is required for media templates')
      return false
    }

    if (formData.type === 'interactive' && !formData.buttonText.trim()) {
      toast.error('Button text is required for interactive templates')
      return false
    }

    if (formData.type === 'location') {
      if (!formData.location.latitude || !formData.location.longitude) {
        toast.error('Latitude and longitude are required for location templates')
        return false
      }
    }

    if (formData.type === 'contact') {
      if (!formData.contact.firstName.trim() || !formData.contact.phoneNumber.trim()) {
        toast.error('First name and phone number are required for contact templates')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const templateData = {
        name: formData.name.trim(),
        content: formData.content.trim(),
        category: formData.category,
        type: formData.type,
        variables: extractedVariables,
        ...(formData.type === 'media' && {
          mediaUrl: formData.mediaUrl.trim(),
          mediaType: formData.mediaType
        }),
        ...(formData.type === 'interactive' && {
          buttonText: formData.buttonText.trim(),
          buttonUrl: formData.buttonUrl.trim()
        }),
        ...(formData.type === 'location' && {
          location: formData.location
        }),
        ...(formData.type === 'contact' && {
          contact: formData.contact
        })
      }

      await templateService.create(templateData)
      toast.success('Template created successfully!')
      navigate('/templates')
    } catch (error) {
      toast.error('Failed to create template')
      console.error('Error creating template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/templates')
  }

  const getPreviewContent = () => {
    let preview = formData.content
    extractedVariables.forEach(variable => {
      preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), `[${variable}]`)
    })
    return preview
  }

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  }

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransition.transition}
      className="h-full p-6 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              icon="ArrowLeft"
              onClick={handleCancel}
              className="p-2"
            />
            <div>
              <h1 className="text-2xl font-semibold text-surface-900">Create Template</h1>
              <p className="text-surface-600">Create a new WhatsApp message template</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Template Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter template name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Type */}
              <div className="bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4">Template Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templateTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('type', type.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.type === type.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <ApperIcon name={type.icon} size={20} />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-sm text-surface-600">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4">Content</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Message Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Enter your message content. Use {{variable}} for dynamic content."
                      rows={4}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      required
                    />
                    <p className="text-xs text-surface-500 mt-1">
                      Use double curly braces for variables: {`{{name}}, {{amount}}, {{date}}`}
                    </p>
                  </div>

                  {/* Variables Display */}
                  {extractedVariables.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Detected Variables
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {extractedVariables.map((variable, index) => (
                          <Badge key={index} variant="secondary" size="sm">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Type-specific Fields */}
              {formData.type === 'media' && (
                <div className="bg-white rounded-lg border border-surface-200 p-6">
                  <h2 className="text-lg font-medium text-surface-900 mb-4">Media Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Media Type *
                      </label>
                      <select
                        value={formData.mediaType}
                        onChange={(e) => handleInputChange('mediaType', e.target.value)}
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select media type</option>
                        {mediaTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Media URL *
                      </label>
                      <Input
                        value={formData.mediaUrl}
                        onChange={(e) => handleInputChange('mediaUrl', e.target.value)}
                        placeholder="https://example.com/media.jpg"
                        type="url"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'interactive' && (
                <div className="bg-white rounded-lg border border-surface-200 p-6">
                  <h2 className="text-lg font-medium text-surface-900 mb-4">Interactive Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Button Text *
                      </label>
                      <Input
                        value={formData.buttonText}
                        onChange={(e) => handleInputChange('buttonText', e.target.value)}
                        placeholder="Click here"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Button URL (optional)
                      </label>
                      <Input
                        value={formData.buttonUrl}
                        onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'location' && (
                <div className="bg-white rounded-lg border border-surface-200 p-6">
                  <h2 className="text-lg font-medium text-surface-900 mb-4">Location Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Latitude *
                      </label>
                      <Input
                        value={formData.location.latitude}
                        onChange={(e) => handleInputChange('location.latitude', e.target.value)}
                        placeholder="40.712776"
                        type="number"
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Longitude *
                      </label>
                      <Input
                        value={formData.location.longitude}
                        onChange={(e) => handleInputChange('location.longitude', e.target.value)}
                        placeholder="-74.005974"
                        type="number"
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Location Name
                      </label>
                      <Input
                        value={formData.location.name}
                        onChange={(e) => handleInputChange('location.name', e.target.value)}
                        placeholder="Central Park"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Address
                      </label>
                      <Input
                        value={formData.location.address}
                        onChange={(e) => handleInputChange('location.address', e.target.value)}
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'contact' && (
                <div className="bg-white rounded-lg border border-surface-200 p-6">
                  <h2 className="text-lg font-medium text-surface-900 mb-4">Contact Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        First Name *
                      </label>
                      <Input
                        value={formData.contact.firstName}
                        onChange={(e) => handleInputChange('contact.firstName', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={formData.contact.lastName}
                        onChange={(e) => handleInputChange('contact.lastName', e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Phone Number *
                      </label>
                      <Input
                        value={formData.contact.phoneNumber}
                        onChange={(e) => handleInputChange('contact.phoneNumber', e.target.value)}
                        placeholder="+1234567890"
                        type="tel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Organization
                      </label>
                      <Input
                        value={formData.contact.organization}
                        onChange={(e) => handleInputChange('contact.organization', e.target.value)}
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Eye" size={18} />
                  Preview
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <ApperIcon name="MessageSquare" size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {getPreviewContent() || 'Your message content will appear here...'}
                          </p>
                          
                          {formData.type === 'interactive' && formData.buttonText && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                                {formData.buttonText}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-surface-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="primary" size="sm">
                        {templateTypes.find(t => t.value === formData.type)?.label || 'Text'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{formData.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variables:</span>
                      <span className="font-medium">{extractedVariables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Length:</span>
                      <span className="font-medium">{formData.content.length} chars</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-surface-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon="Save"
            >
              Create Template
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default CreateTemplate