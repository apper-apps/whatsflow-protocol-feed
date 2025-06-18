import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { templateService } from '@/services'
import TemplateCard from '@/components/molecules/TemplateCard'
import SearchBar from '@/components/molecules/SearchBar'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import ErrorState from '@/components/organisms/ErrorState'
import EmptyState from '@/components/organisms/EmptyState'
import { toast } from 'react-toastify'

const Templates = () => {
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Greeting', 'Orders', 'Shipping', 'Support', 'Marketing']

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchQuery, selectedCategory])

  const loadTemplates = async () => {
    setLoading(true)
    setError(null)
    try {
      const templatesData = await templateService.getAll()
      setTemplates(templatesData)
    } catch (err) {
      setError(err.message || 'Failed to load templates')
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = [...templates]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(template => 
        template.name?.toLowerCase().includes(query) ||
        template.content?.toLowerCase().includes(query) ||
        template.category?.toLowerCase().includes(query)
      )
    }

    setFilteredTemplates(filtered)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  const handleEdit = (template) => {
    toast.info('Edit template functionality coming soon')
  }

  const handleDelete = async (template) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await templateService.delete(template.Id)
        setTemplates(prev => prev.filter(t => t.Id !== template.Id))
        toast.success('Template deleted successfully')
      } catch (err) {
        toast.error('Failed to delete template')
      }
    }
  }

  const handleUse = (template) => {
    // Copy template content to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(template.content)
      toast.success('Template copied to clipboard')
    } else {
      toast.info('Template ready to use')
    }
  }

  const pageTransitionInitial = { opacity: 0, x: 20 }
  const pageTransitionAnimate = { opacity: 1, x: 0 }
  const pageTransitionConfig = { duration: 0.3 }

  const staggerItemInitial = { opacity: 0, y: 20 }
  const staggerItemAnimate = { opacity: 1, y: 0 }
  const getStaggerTransition = (index) => ({ delay: index * 0.1 })

  if (loading) {
    return (
      <motion.div
        initial={pageTransitionInitial}
        animate={pageTransitionAnimate}
        transition={pageTransitionConfig}
        className="h-full p-6"
      >
        <div className="mb-6">
          <div className="h-8 bg-surface-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-10 bg-surface-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={staggerItemInitial}
              animate={staggerItemAnimate}
              transition={getStaggerTransition(i)}
              className="bg-white rounded-lg p-4 shadow-sm"
            >
              <SkeletonLoader count={1} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={pageTransitionInitial}
        animate={pageTransitionAnimate}
        transition={pageTransitionConfig}
        className="h-full flex items-center justify-center p-6"
      >
        <ErrorState 
          message={error}
          onRetry={loadTemplates}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={pageTransitionInitial}
      animate={pageTransitionAnimate}
      transition={pageTransitionConfig}
      className="h-full p-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
<h1 className="text-2xl font-semibold text-surface-900">Templates</h1>
            <p className="text-surface-600">Manage your message templates</p>
          </div>
          <Button 
            variant="primary" 
            icon="Plus"
            onClick={() => window.location.href = '/templates/create'}
          >
            Create Template
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search templates..."
              onSearch={handleSearch}
            />
          </div>
          <span className="text-sm text-surface-500">{filteredTemplates.length} templates</span>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className="transition-all duration-150"
            >
              <Badge
                variant={selectedCategory === category ? 'primary' : 'default'}
                className={`cursor-pointer hover:scale-105 ${
                  selectedCategory === category ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
                {category !== 'all' && (
                  <span className="ml-1">
                    ({templates.filter(t => t.category === category).length})
                  </span>
                )}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
{templates.length === 0 ? (
        <EmptyState 
          title="No templates yet"
          description="Create your first message template to save time"
          actionLabel="Create Template"
          onAction={() => window.location.href = '/templates/create'}
          icon="FileText"
        />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState 
          title="No matches found"
          description="Try adjusting your search or category filter"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('')
            setSelectedCategory('all')
          }}
          icon="Search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.Id}
                initial={staggerItemInitial}
                animate={staggerItemAnimate}
                transition={getStaggerTransition(index)}
                layout
              >
                <TemplateCard
                  template={template}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUse={handleUse}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default Templates