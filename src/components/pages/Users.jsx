import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import { userService } from "@/services";
import UserModal from "@/components/molecules/UserModal";

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAll()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError('Failed to load users')
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await userService.delete(userId)
      setUsers(prev => prev.filter(u => u.Id !== userId))
      toast.success('User deleted successfully')
    } catch (err) {
      toast.error('Failed to delete user')
    }
  }

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        const updatedUser = await userService.update(editingUser.Id, userData)
        setUsers(prev => prev.map(u => u.Id === editingUser.Id ? updatedUser : u))
        toast.success('User updated successfully')
      } else {
        const newUser = await userService.create(userData)
        setUsers(prev => [newUser, ...prev])
        toast.success('User created successfully')
      }
      setShowModal(false)
} catch (err) {
      toast.error('Failed to save user')
    }
  }

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      const isSelected = prev.includes(userId)
      const newSelected = isSelected 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
      
      // Update select all state
      setSelectAll(newSelected.length === filteredUsers.length && filteredUsers.length > 0)
      return newSelected
    })
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
      setSelectAll(false)
    } else {
      const allUserIds = filteredUsers.map(user => user.Id)
      setSelectedUsers(allUserIds)
      setSelectAll(true)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users to delete')
      return
    }

    const confirmMessage = `Are you sure you want to delete ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}?`
    if (!confirm(confirmMessage)) return

    try {
      // Delete selected users
      await Promise.all(selectedUsers.map(userId => userService.delete(userId)))
      
      // Update state
      setUsers(prev => prev.filter(u => !selectedUsers.includes(u.Id)))
      setSelectedUsers([])
      setSelectAll(false)
      
      toast.success(`${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} deleted successfully`)
    } catch (err) {
      toast.error('Failed to delete users')
    }
  }

  const handleExport = () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users to export')
      return
    }
    setShowExportModal(true)
  }

  const generateCSV = (users) => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Department', 'Last Login']
    const rows = users.map(user => [
      user.Id,
      user.name,
      user.email,
      user.phone || '',
      user.role,
      user.status,
      user.department || '',
      user.lastLogin || ''
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    return csvContent
  }

  const generateJSON = (users) => {
    return JSON.stringify(users, null, 2)
  }

  const exportUsers = (format) => {
    const selectedUserData = users.filter(user => selectedUsers.includes(user.Id))
    
    if (selectedUserData.length === 0) {
      toast.error('No users selected for export')
      return
    }

    const timestamp = new Date().toISOString().split('T')[0]
    
    try {
      if (format === 'csv') {
        const csvContent = generateCSV(selectedUserData)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `users-export-${timestamp}.csv`)
        toast.success(`${selectedUserData.length} users exported as CSV`)
      } else if (format === 'json') {
        const jsonContent = generateJSON(selectedUserData)
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
        saveAs(blob, `users-export-${timestamp}.json`)
        toast.success(`${selectedUserData.length} users exported as JSON`)
      }
      
      setShowExportModal(false)
    } catch (err) {
      toast.error('Failed to export users')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'error'
      case 'manager': return 'warning'
      case 'agent': return 'primary'
      default: return 'default'
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'default'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-200 rounded w-1/4"></div>
          <div className="h-12 bg-surface-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 mb-2">Error loading users</h3>
          <p className="text-surface-600 mb-4">{error}</p>
          <Button onClick={loadUsers}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
    <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-2">User Management</h1>
        <p className="text-surface-600">Manage users, roles, and permissions</p>
    </div>
    {/* Header Controls */}
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
            <Input
                icon="Search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
            <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
            </select>
            {selectedUsers.length > 0 && <>
                <Button variant="outline" icon="Download" onClick={handleExport}>Export ({selectedUsers.length})
                                  </Button>
                <Button variant="danger" icon="Trash2" onClick={handleBulkDelete}>Delete ({selectedUsers.length})
                                  </Button>
            </>}
            <Button icon="Plus" onClick={handleAddUser}>Add User
                          </Button>
        </div>
    </div>
    {/* Users Table */}
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                    <tr>
                        <th className="text-left py-3 px-4 font-medium text-surface-700 w-12">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary/20" />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-surface-700">User</th>
                        <th className="text-left py-3 px-4 font-medium text-surface-700">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-surface-700">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-surface-700">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-surface-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {filteredUsers.map((user, index) => <motion.tr
                            key={user.Id}
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                delay: index * 0.1
                            }}
                            className="border-b border-surface-100 hover:bg-surface-50">
                            <td className="py-4 px-4">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.Id)}
                                    onChange={() => toggleSelectUser(user.Id)}
                                    className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary/20" />
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                    <Avatar name={user.name} size="sm" />
                                    <div>
                                        <div className="font-medium text-surface-900">{user.name}</div>
                                        <div className="text-sm text-surface-500">ID: {user.Id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <div>
                                    <div className="text-surface-900">{user.email}</div>
                                    <div className="text-sm text-surface-500">{user.phone}</div>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                    {user.role}
                                </Badge>
                            </td>
                            <td className="py-4 px-4">
                                <Badge variant={getStatusBadgeVariant(user.status)}>
                                    {user.status}
                                </Badge>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex justify-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon="Edit"
                                        onClick={() => handleEditUser(user)} />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon="Trash2"
                                        onClick={() => handleDeleteUser(user.Id)}
                                        className="text-error hover:text-error" />
                                </div>
                            </td>
                        </motion.tr>)}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    </div>
    {filteredUsers.length === 0 && <div className="text-center py-12">
        <ApperIcon name="Users" size={48} className="text-surface-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-surface-900 mb-2">No users found</h3>
        <p className="text-surface-600">
            {searchQuery || filterRole !== "all" ? "Try adjusting your search or filters" : "Get started by adding your first user"}
        </p>
</div>}

      {/* Selected Users Summary */}
      {selectedUsers.length > 0 && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedUsers([])
                setSelectAll(false)
              }}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">Export Users</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowExportModal(false)}
              />
            </div>
            
            <div className="mb-6">
              <p className="text-surface-600 mb-4">
                Export {selectedUsers.length} selected user{selectedUsers.length > 1 ? 's' : ''} in your preferred format:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => exportUsers('csv')}
                  className="w-full p-4 text-left border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ApperIcon name="FileText" size={20} className="text-green-600" />
                    <div>
                      <div className="font-medium text-surface-900">CSV Format</div>
                      <div className="text-sm text-surface-500">Comma-separated values, compatible with Excel</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => exportUsers('json')}
                  className="w-full p-4 text-left border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ApperIcon name="Code" size={20} className="text-blue-600" />
                    <div>
                      <div className="font-medium text-surface-900">JSON Format</div>
                      <div className="text-sm text-surface-500">JavaScript Object Notation, structured data</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Users