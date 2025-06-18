import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contactService } from '@/services'
import ContactCard from '@/components/molecules/ContactCard'
import SearchBar from '@/components/molecules/SearchBar'
import Button from '@/components/atoms/Button'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import ErrorState from '@/components/organisms/ErrorState'
import EmptyState from '@/components/organisms/EmptyState'
import { toast } from 'react-toastify'

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchQuery])

  const loadContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const contactsData = await contactService.getAll()
      setContacts(contactsData)
    } catch (err) {
      setError(err.message || 'Failed to load contacts')
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const filterContacts = () => {
    let filtered = [...contacts]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(contact => 
        contact.name?.toLowerCase().includes(query) ||
        contact.phone?.toLowerCase().includes(query) ||
        contact.notes?.toLowerCase().includes(query) ||
        contact.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort by last message time (most recent first)
    filtered.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    
    setFilteredContacts(filtered)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleEdit = (contact) => {
    toast.info('Edit contact functionality coming soon')
  }

  const handleDelete = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      try {
        await contactService.delete(contact.Id)
        setContacts(prev => prev.filter(c => c.Id !== contact.Id))
        toast.success('Contact deleted successfully')
      } catch (err) {
        toast.error('Failed to delete contact')
      }
    }
  }

  const handleViewConversations = (contact) => {
    toast.info('View conversations functionality coming soon')
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
          onRetry={loadContacts}
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
            <h1 className="text-2xl font-semibold text-surface-900">Contacts</h1>
            <p className="text-surface-600">Manage your customer contacts</p>
          </div>
          <Button variant="primary" icon="Plus">
            Add Contact
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search contacts..."
              onSearch={handleSearch}
              showFilters={true}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">{filteredContacts.length} contacts</span>
            <div className="flex items-center border border-surface-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'text-surface-600 hover:bg-surface-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'text-surface-600 hover:bg-surface-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {contacts.length === 0 ? (
        <EmptyState 
          title="No contacts yet"
          description="Add your first contact to start managing customer relationships"
          actionLabel="Add Contact"
          onAction={() => toast.info('Add contact functionality coming soon')}
          icon="Users"
        />
      ) : filteredContacts.length === 0 ? (
        <EmptyState 
          title="No matches found"
          description="Try adjusting your search or filters"
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
          icon="Search"
        />
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          <AnimatePresence>
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.Id}
                initial={staggerItemInitial}
                animate={staggerItemAnimate}
                transition={getStaggerTransition(index)}
                layout
              >
                <ContactCard
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewConversations={handleViewConversations}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default Contacts