import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { templateService } from "@/services";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const CreateTemplate = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'UTILITY',
    language: 'en',
    headerType: 'NONE',
    headerText: '',
    headerMediaUrl: '',
    body: '',
    footerText: '',
    variables: []
  })
  const [extractedVariables, setExtractedVariables] = useState([])
  const [nameValidation, setNameValidation] = useState({ isValid: true, message: '' })

  // WhatsApp Business API Categories
  const categories = [
    { value: 'UTILITY', label: 'Utility', description: 'For confirmations, receipts, and notifications' },
    { value: 'MARKETING', label: 'Marketing', description: 'For promotional and marketing messages' },
    { value: 'AUTHENTICATION', label: 'Authentication', description: 'For user authentication and verification' }
  ]

  // Language options
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'bn', label: 'Bengali' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'kn', label: 'Kannada' },
    { value: 'ml', label: 'Malayalam' },
    { value: 'pa', label: 'Punjabi' }
  ]

  // Header types
  const headerTypes = [
    { value: 'NONE', label: 'None', description: 'No header' },
    { value: 'TEXT', label: 'Text', description: 'Text-only header' },
    { value: 'IMAGE', label: 'Image', description: 'Image header' },
    { value: 'VIDEO', label: 'Video', description: 'Video header' },
    { value: 'DOCUMENT', label: 'Document', description: 'Document header' }
  ]

  const mediaTypes = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document' },
    { value: 'audio', label: 'Audio' }
  ]

// Extract variables from body content
  useEffect(() => {
    const variableRegex = /\{\{(\d+)\}\}/g
    const matches = [...formData.body.matchAll(variableRegex)]
    const variables = [...new Set(matches.map(match => parseInt(match[1], 10)))]
      .sort((a, b) => a - b)
    setExtractedVariables(variables)
    setFormData(prev => ({ ...prev, variables }))
  }, [formData.body])

const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Validate template name on change
    if (field === 'name') {
      validateTemplateName(value)
    }
  }

  const validateTemplateName = (name) => {
    const namePattern = /^[a-z0-9_]+$/
    if (!name) {
      setNameValidation({ isValid: true, message: '' })
    } else if (!namePattern.test(name)) {
      setNameValidation({ 
        isValid: false, 
        message: 'Name must be lowercase letters, numbers, and underscores only (no spaces)' 
      })
    } else if (name.length > 512) {
      setNameValidation({ 
        isValid: false, 
        message: 'Name must be 512 characters or less' 
      })
    } else {
      setNameValidation({ isValid: true, message: '' })
    }
  }

  const insertVariable = (variableNumber) => {
    const variable = `{{${variableNumber}}}`
    setFormData(prev => ({
      ...prev,
      body: prev.body + variable
    }))
  }

  const validateForm = () => {
    // Template name validation
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return false
    }
    if (!nameValidation.isValid) {
      toast.error('Please fix template name format')
      return false
    }

    // Body content validation
    if (!formData.body.trim()) {
      toast.error('Template body content is required')
      return false
    }
    if (formData.body.length > 1024) {
      toast.error('Template body must be 1024 characters or less')
      return false
    }

    // Header validation
    if (formData.headerType === 'TEXT' && !formData.headerText.trim()) {
      toast.error('Header text is required when header type is Text')
      return false
    }
    if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formData.headerType) && !formData.headerMediaUrl.trim()) {
      toast.error('Media URL is required for media headers')
      return false
    }

    // Footer validation
    if (formData.footerText && formData.footerText.length > 60) {
      toast.error('Footer text must be 60 characters or less')
      return false
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
        category: formData.category,
        language: formData.language,
        components: [
          // Header component (if not NONE)
          ...(formData.headerType !== 'NONE' ? [{
            type: 'HEADER',
            format: formData.headerType,
            ...(formData.headerType === 'TEXT' && { text: formData.headerText.trim() }),
            ...(formData.headerType !== 'TEXT' && formData.headerMediaUrl && { 
              example: { header_url: [formData.headerMediaUrl.trim()] }
            })
          }] : []),
          // Body component (always required)
          {
            type: 'BODY',
            text: formData.body.trim(),
            ...(extractedVariables.length > 0 && {
              example: { body_text: [extractedVariables.map(v => `{{${v}}}`)] }
            })
          },
          // Footer component (if provided)
          ...(formData.footerText?.trim() ? [{
            type: 'FOOTER',
            text: formData.footerText.trim()
          }] : [])
        ],
        variables: extractedVariables,
        // Legacy fields for backward compatibility
        content: formData.body.trim(),
        type: 'text'
      }

      await templateService.create(templateData)
      toast.success('WhatsApp template created successfully!')
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
    let preview = formData.body
    extractedVariables.forEach(variable => {
      preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), `[Sample ${variable}]`)
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
              {/* Template Information */}
              <div className="bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4">Template Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Template Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., order_update, payment_reminder"
                      required
                      className={!nameValidation.isValid ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-surface-500 mt-1">
                      Use lowercase letters, numbers, and underscores only (no spaces)
                    </p>
                    {!nameValidation.isValid && (
                      <p className="text-xs text-red-600 mt-1">{nameValidation.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-surface-500 mt-1">
                        {categories.find(c => c.value === formData.category)?.description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Language *
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        {languages.map(language => (
                          <option key={language.value} value={language.value}>
                            {language.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

{/* Header Settings */}
              <div className="bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4">Header Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Header Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {headerTypes.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange('headerType', type.value)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            formData.headerType === type.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-surface-200 hover:border-surface-300'
                          }`}
                        >
                          <div className="font-medium text-sm mb-1">{type.label}</div>
                          <div className="text-xs text-surface-500">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.headerType === 'TEXT' && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Header Text *
                      </label>
                      <Input
                        value={formData.headerText}
                        onChange={(e) => handleInputChange('headerText', e.target.value)}
                        placeholder="Enter header text"
                        maxLength={60}
                      />
                      <p className="text-xs text-surface-500 mt-1">
                        {formData.headerText.length}/60 characters
                      </p>
                    </div>
                  )}

                  {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formData.headerType) && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Media URL *
                      </label>
                      <Input
                        value={formData.headerMediaUrl}
                        onChange={(e) => handleInputChange('headerMediaUrl', e.target.value)}
                        placeholder="https://example.com/media.jpg"
                        type="url"
                      />
                    </div>
                  )}
                </div>
              </div>

{/* Body Content */}
              <div className="bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4">Body Content</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Message Body *
                    </label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => handleInputChange('body', e.target.value)}
                      placeholder="Enter your message body. Use {{1}}, {{2}}, etc. for dynamic content."
                      rows={6}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      required
                      maxLength={1024}
                    />
<div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-surface-500">
                        Use numbered variables: {'{{1}}'}, {'{{2}}'}, {'{{3}}'}, etc.
                      </p>
                      <span className="text-xs text-surface-500">
                        {formData.body.length}/1024 characters
                      </span>
                    </div>
                  </div>

                  {/* Variable Insertion Helper */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Quick Variable Insert
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <Button
                          key={num}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(num)}
                        >
                          Insert {'{{' + num + '}}'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Detected Variables Display */}
                  {extractedVariables.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Detected Variables ({extractedVariables.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {extractedVariables.map((variable, index) => (
                          <Badge key={index} variant="primary" size="sm">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Settings */}
              <div className="bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4">Footer Settings (Optional)</h2>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Footer Text
                  </label>
                  <Input
                    value={formData.footerText}
                    onChange={(e) => handleInputChange('footerText', e.target.value)}
                    placeholder="e.g., Powered by Your Company"
                    maxLength={60}
                  />
                  <p className="text-xs text-surface-500 mt-1">
                    Optional footer text (max 60 characters) - {formData.footerText.length}/60
                  </p>
                </div>
              </div>

            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-lg border border-surface-200 p-6">
                <h2 className="text-lg font-medium text-surface-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Eye" size={18} />
                  Preview
                </h2>
                
<div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      {/* Header Preview */}
                      {formData.headerType !== 'NONE' && (
                        <div className="border-b border-gray-200 pb-3">
                          {formData.headerType === 'TEXT' && formData.headerText && (
                            <div className="font-semibold text-gray-900">
                              {formData.headerText}
                            </div>
                          )}
                          {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formData.headerType) && formData.headerMediaUrl && (
                            <div className="bg-gray-200 rounded p-3 text-center text-sm text-gray-600">
                              [{formData.headerType} MEDIA]
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Body Preview */}
                      <div>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {getPreviewContent() || 'Your message body will appear here...'}
                        </p>
                      </div>
                      
                      {/* Footer Preview */}
                      {formData.footerText && (
                        <div className="border-t border-gray-200 pt-2">
                          <p className="text-xs text-gray-600">
                            {formData.footerText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-surface-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium font-mono">{formData.name || 'template_name'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <Badge variant="primary" size="sm">
                        {categories.find(c => c.value === formData.category)?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span className="font-medium">
                        {languages.find(l => l.value === formData.language)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Header:</span>
                      <span className="font-medium">{formData.headerType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variables:</span>
                      <span className="font-medium">{extractedVariables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Body Length:</span>
                      <span className="font-medium">{formData.body.length}/1024 chars</span>
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