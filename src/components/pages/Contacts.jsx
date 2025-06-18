import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import Papa from "papaparse";
import { contactService } from "@/services";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import SkeletonLoader from "@/components/atoms/SkeletonLoader";
import ContactCard from "@/components/molecules/ContactCard";
import ContactModal from "@/components/molecules/ContactModal";
import SearchBar from "@/components/molecules/SearchBar";
import ErrorState from "@/components/organisms/ErrorState";
import EmptyState from "@/components/organisms/EmptyState";
import ApperIcon from "@/components/ApperIcon";

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'grid', 'table'
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    agent: '',
    tags: '',
    dateRange: '',
    priority: ''
  })
  const [sortConfig, setSortConfig] = useState({ key: 'lastMessageAt', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
useEffect(() => {
    loadContacts()
    loadTeamMembers()
  }, [])

useEffect(() => {
    filterContacts()
  }, [contacts, searchQuery, filters])

  useEffect(() => {
    setShowBulkActions(selectedContacts.length > 0)
  }, [selectedContacts])
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

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(contact => 
        contact.name?.toLowerCase().includes(query) ||
        contact.phone?.toLowerCase().includes(query) ||
        contact.notes?.toLowerCase().includes(query) ||
        contact.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(contact => contact.leadStatus === filters.status)
    }

    // Filter by assigned agent
    if (filters.agent) {
      filtered = filtered.filter(contact => contact.assignedTo === filters.agent)
    }

    // Filter by tags
    if (filters.tags) {
      filtered = filtered.filter(contact => 
        contact.tags?.some(tag => tag.toLowerCase().includes(filters.tags.toLowerCase()))
      )
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(contact => contact.priority === filters.priority)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (sortConfig.key === 'lastMessageAt' || sortConfig.key === 'createdAt') {
        const aDate = new Date(aValue)
        const bDate = new Date(bValue)
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    setFilteredContacts(filtered)
  }

const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }
  const loadTeamMembers = async () => {
    try {
      const members = await contactService.getTeamMembers()
      setTeamMembers(members)
    } catch (err) {
      console.error('Failed to load team members:', err)
    }
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setShowContactModal(true)
  }

  const handleAddContact = () => {
    setEditingContact(null)
    setShowContactModal(true)
  }

  const handleSaveContact = async (contactData) => {
    try {
      if (editingContact) {
        const updatedContact = await contactService.update(editingContact.Id, contactData)
        setContacts(prev => prev.map(c => c.Id === editingContact.Id ? updatedContact : c))
        toast.success('Contact updated successfully')
      } else {
        const newContact = await contactService.create(contactData)
        setContacts(prev => [...prev, newContact])
        toast.success('Contact created successfully')
      }
      setShowContactModal(false)
      setEditingContact(null)
    } catch (err) {
      toast.error(editingContact ? 'Failed to update contact' : 'Failed to create contact')
    }
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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAll = () => {
    const currentPageContacts = getCurrentPageContacts()
    const allSelected = currentPageContacts.every(contact => selectedContacts.includes(contact.Id))
    
    if (allSelected) {
      setSelectedContacts(prev => prev.filter(id => !currentPageContacts.some(c => c.Id === id)))
    } else {
      const newSelections = currentPageContacts.map(contact => contact.Id)
      setSelectedContacts(prev => [...new Set([...prev, ...newSelections])])
    }
  }

  const handleBulkAssign = async (agentName) => {
    try {
      await contactService.bulkAssign(selectedContacts, agentName)
      setContacts(prev => prev.map(contact => 
        selectedContacts.includes(contact.Id) 
          ? { ...contact, assignedTo: agentName }
          : contact
      ))
      setSelectedContacts([])
      toast.success(`${selectedContacts.length} contacts assigned to ${agentName}`)
    } catch (err) {
      toast.error('Failed to assign contacts')
    }
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
      try {
        await Promise.all(selectedContacts.map(id => contactService.delete(id)))
        setContacts(prev => prev.filter(contact => !selectedContacts.includes(contact.Id)))
        setSelectedContacts([])
        toast.success(`${selectedContacts.length} contacts deleted`)
      } catch (err) {
        toast.error('Failed to delete contacts')
      }
    }
  }

  const handleExport = () => {
    const exportData = filteredContacts.map(contact => ({
      Name: contact.name,
      Phone: contact.phone,
      Email: contact.email || '',
      Status: contact.leadStatus,
      'Assigned To': contact.assignedTo,
      Tags: contact.tags?.join(', ') || '',
      Priority: contact.priority,
      'Created Date': new Date(contact.createdAt).toLocaleDateString(),
      'Last Message': new Date(contact.lastMessageAt).toLocaleDateString()
    }))

    const csv = Papa.unparse(exportData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `contacts-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Contacts exported successfully')
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const importedContacts = results.data
            .filter(row => row.Name && row.Phone)
            .map(row => ({
              name: row.Name,
              phone: row.Phone,
              email: row.Email || '',
              leadStatus: row.Status || 'new',
              assignedTo: row['Assigned To'] || '',
              tags: row.Tags ? row.Tags.split(',').map(tag => tag.trim()) : [],
              priority: row.Priority || 'medium',
              notes: row.Notes || ''
            }))

          for (const contactData of importedContacts) {
            await contactService.create(contactData)
          }

          loadContacts()
          toast.success(`${importedContacts.length} contacts imported successfully`)
        } catch (err) {
          toast.error('Failed to import contacts')
        }
      },
      error: (error) => {
        toast.error('Failed to parse CSV file')
      }
    })
    
    event.target.value = ''
  }

  const getCurrentPageContacts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredContacts.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)

  const getStatusBadgeVariant = (status) => {
    const variants = {
      'new': 'info',
      'contacted': 'warning',
      'qualified': 'primary',
      'proposal': 'secondary',
      'closed': 'success',
      'lost': 'error'
    }
    return variants[status] || 'default'
  }

  const getPriorityBadgeVariant = (priority) => {
    const variants = {
      'high': 'error',
      'medium': 'warning',
      'low': 'success'
    }
    return variants[priority] || 'default'
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
    className="h-full p-6 overflow-y-auto">
    {/* Header */}
    <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-2xl font-semibold text-surface-900">Contacts</h1>
                <p className="text-surface-600">Manage your customer contacts and leads</p>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="hidden"
                    id="import-contacts" />
                <Button
                    variant="outline"
                    icon="Upload"
                    onClick={() => document.getElementById("import-contacts").click()}>Import
                                </Button>
                <Button variant="outline" icon="Download" onClick={handleExport}>Export
                                </Button>
                <Button variant="primary" icon="Plus" onClick={handleAddContact}>Add Contact
                                </Button>
            </div>
        </div>
        {/* Search and Filters */}
        <div
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
                <SearchBar
                    placeholder="Search contacts..."
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    showFilters={true}
                    teamMembers={teamMembers}
                    filters={filters} />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-surface-500">{filteredContacts.length}contacts</span>
                <div className="flex items-center border border-surface-200 rounded-lg">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-l-lg transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-surface-600 hover:bg-surface-50"}`}>
                        <ApperIcon name="Grid3x3" size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`p-2 rounded-r-lg transition-colors ${viewMode === "table" ? "bg-primary text-white" : "text-surface-600 hover:bg-surface-50"}`}>
                        <ApperIcon name="Table" size={16} />
                    </button>
                </div>
            </div>
        </div>
        {/* Bulk Actions Bar */}
        <AnimatePresence>
            {showBulkActions && <motion.div
                initial={{
                    opacity: 0,
                    y: -10
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                exit={{
                    opacity: 0,
                    y: -10
                }}
                className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ApperIcon name="CheckCircle" size={16} className="text-primary" />
                        <span className="text-sm font-medium text-surface-900">
                            {selectedContacts.length}contact{selectedContacts.length !== 1 ? "s" : ""}selected
                                              </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                onChange={e => e.target.value && handleBulkAssign(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                defaultValue="">
                                <option value="">Assign to Agent</option>
                                {teamMembers.map(member => <option key={member.Id} value={member.name}>
                                    {member.name}
                                </option>)}
                            </select>
                        </div>
                        <Button variant="outline" size="sm" icon="Trash2" onClick={handleBulkDelete}>Delete
                                              </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedContacts([])}>Clear
                                              </Button>
                    </div>
                </div>
            </motion.div>}
        </AnimatePresence>
    </div>
    {/* Content */}
    {contacts.length === 0 ? <EmptyState
        title="No contacts yet"
        description="Add your first contact to start managing customer relationships"
        actionLabel="Add Contact"
        onAction={handleAddContact} /> : filteredContacts.length === 0 ? <EmptyState
        title="No matches found"
        description="Try adjusting your search or filters"
        actionLabel="Clear Search"
        onAction={() => {
            setSearchQuery("");

            setFilters({
                status: "",
                agent: "",
                tags: "",
                dateRange: "",
                priority: ""
            });
        }}
        icon="Search" /> : viewMode === "grid" ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
            {getCurrentPageContacts().map((contact, index) => <motion.div
                key={contact.Id}
                initial={staggerItemInitial}
                animate={staggerItemAnimate}
                transition={getStaggerTransition(index)}
                layout>
                <ContactCard
                    contact={contact}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewConversations={handleViewConversations} />
            </motion.div>)}
        </AnimatePresence>
    </div> : <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                    <tr>
                        <th className="w-12 px-4 py-3">
                            <input
                                type="checkbox"
                                checked={getCurrentPageContacts().length > 0 && getCurrentPageContacts().every(contact => selectedContacts.includes(contact.Id))}
                                onChange={handleSelectAll}
                                className="rounded border-surface-300 text-primary focus:ring-primary/20" />
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                            onClick={() => handleSort("name")}>
                            <div className="flex items-center gap-1">Name
                                                      <ApperIcon
                                    name={sortConfig.key === "name" ? sortConfig.direction === "asc" ? "ChevronUp" : "ChevronDown" : "ChevronsUpDown"}
                                    size={12} />
                            </div>
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Phone
                                              </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Email
                                              </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                            onClick={() => handleSort("leadStatus")}>
                            <div className="flex items-center gap-1">Status
                                                      <ApperIcon
                                    name={sortConfig.key === "leadStatus" ? sortConfig.direction === "asc" ? "ChevronUp" : "ChevronDown" : "ChevronsUpDown"}
                                    size={12} />
                            </div>
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                            onClick={() => handleSort("assignedTo")}>
                            <div className="flex items-center gap-1">Assigned Agent
                                                      <ApperIcon
                                    name={sortConfig.key === "assignedTo" ? sortConfig.direction === "asc" ? "ChevronUp" : "ChevronDown" : "ChevronsUpDown"}
                                    size={12} />
                            </div>
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Tags
                                              </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100"
                            onClick={() => handleSort("createdAt")}>
                            <div className="flex items-center gap-1">Created Date
                                                      <ApperIcon
                                    name={sortConfig.key === "createdAt" ? sortConfig.direction === "asc" ? "ChevronUp" : "ChevronDown" : "ChevronsUpDown"}
                                    size={12} />
                            </div>
                        </th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Actions
                                              </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-surface-200">
                    <AnimatePresence>
                        {getCurrentPageContacts().map((contact, index) => <motion.tr
                            key={contact.Id}
                            initial={staggerItemInitial}
                            animate={staggerItemAnimate}
                            transition={getStaggerTransition(index)}
                            className={`hover:bg-surface-50 ${selectedContacts.includes(contact.Id) ? "bg-primary/5" : ""}`}>
                            <td className="px-4 py-4">
                                <input
                                    type="checkbox"
                                    checked={selectedContacts.includes(contact.Id)}
                                    onChange={() => handleSelectContact(contact.Id)}
                                    className="rounded border-surface-300 text-primary focus:ring-primary/20" />
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <Avatar name={contact.name} size="sm" />
                                    <div>
                                        <div className="font-medium text-surface-900">{contact.name}</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Badge variant={getPriorityBadgeVariant(contact.priority)} size="sm">
                                                {contact.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-surface-900">
                                {contact.phone}
                            </td>
                            <td className="px-4 py-4 text-sm text-surface-900">
                                {contact.email || "-"}
                            </td>
                            <td className="px-4 py-4">
                                <Badge variant={getStatusBadgeVariant(contact.leadStatus)} size="sm">
                                    {contact.leadStatus}
                                </Badge>
                            </td>
                            <td className="px-4 py-4">
                                {contact.assignedTo ? <div className="flex items-center gap-2">
                                    <Avatar name={contact.assignedTo} size="sm" />
                                    <span className="text-sm text-surface-900">{contact.assignedTo}</span>
                                </div> : <span className="text-sm text-surface-400">Unassigned</span>}
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {contact.tags?.slice(0, 2).map((tag, tagIndex) => <Badge key={tagIndex} variant="secondary" size="sm">
                                        {tag}
                                    </Badge>)}
                                    {contact.tags?.length > 2 && <Badge variant="default" size="sm">+{contact.tags.length - 2}
                                    </Badge>}
                                </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-surface-500">
                                {formatDistanceToNow(new Date(contact.createdAt), {
                                    addSuffix: true
                                })}
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon="Eye"
                                        onClick={() => handleViewConversations(contact)} />
                                    <Button variant="ghost" size="sm" icon="Edit" onClick={() => handleEdit(contact)} />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon="Trash2"
                                        onClick={() => handleDelete(contact)}
                                        className="text-error hover:text-error hover:bg-error/10" />
                                </div>
                            </td>
                        </motion.tr>)}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    </div>}
    {/* Pagination */}
    {filteredContacts.length > itemsPerPage && <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-surface-500">Showing {(currentPage - 1) * itemsPerPage + 1}to {Math.min(currentPage * itemsPerPage, filteredContacts.length)}of {filteredContacts.length}contacts
                      </div>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                icon="ChevronLeft"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1} />
            <div className="flex items-center gap-1">
                {Array.from({
                    length: Math.min(5, totalPages)
                }, (_, i) => {
                    let pageNum;

                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = currentPage - 2 + i;
                    }

                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${currentPage === pageNum ? "bg-primary text-white" : "text-surface-600 hover:bg-surface-100"}`}>
                            {pageNum}
                        </button>
                    );
                })}
            </div>
            <Button
                variant="outline"
                size="sm"
                icon="ChevronRight"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages} />
        </div>
    </div>}
    {/* Contact Modal */}
    <ContactModal
        isOpen={showContactModal}
        onClose={() => {
            setShowContactModal(false);
            setEditingContact(null);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
        teamMembers={teamMembers} />
</motion.div>
  )
}

export default Contacts