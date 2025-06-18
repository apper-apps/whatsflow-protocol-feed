import { useState } from 'react'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  onFilter,
  showFilters = false,
  className = '',
  teamMembers = [],
  filters = {},
  ...props 
}) => {
const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    status: '',
    agent: '',
    tags: '',
    dateRange: '',
    priority: ''
  })
  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

const toggleFilters = () => {
    setShowFilterPanel(!showFilterPanel)
  }

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    if (onFilter) {
      onFilter(localFilters)
    }
    setShowFilterPanel(false)
  }

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      agent: '',
      tags: '',
      dateRange: '',
      priority: ''
    }
    setLocalFilters(clearedFilters)
    if (onFilter) {
      onFilter(clearedFilters)
    }
  }
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Input
            icon="Search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            rightIcon={searchQuery ? 'X' : null}
            className="w-full"
            {...props}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              <ApperIcon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Filter Button */}
        {showFilters && (
          <Button
            variant="outline"
            icon="Filter"
            onClick={toggleFilters}
            className={showFilterPanel ? 'bg-surface-100' : ''}
          >
            Filter
          </Button>
        )}
      </div>

      {/* Filter Panel */}
{showFilterPanel && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-surface-200 rounded-lg shadow-lg z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Lead Status
              </label>
              <select 
                className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="closed">Closed</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Priority
              </label>
              <select 
                className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={localFilters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Assigned Agent
              </label>
              <select 
                className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={localFilters.agent}
                onChange={(e) => handleFilterChange('agent', e.target.value)}
              >
                <option value="">All Agents</option>
                <option value="">Unassigned</option>
                {teamMembers.map(member => (
                  <option key={member.Id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Filter by tags..."
                className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={localFilters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Date Range
              </label>
              <select 
                className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={localFilters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-surface-200">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleFilters}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar