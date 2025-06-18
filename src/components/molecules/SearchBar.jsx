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
  ...props 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Status
              </label>
              <select className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="ongoing">Ongoing</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Date Range
              </label>
              <select className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Assigned To
              </label>
              <select className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">All Agents</option>
                <option value="agent1">Agent 1</option>
                <option value="agent2">Agent 2</option>
                <option value="agent3">Agent 3</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-surface-200">
            <Button variant="ghost" size="sm" onClick={toggleFilters}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              if (onFilter) onFilter()
              toggleFilters()
            }}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar