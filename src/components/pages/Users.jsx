import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import Avatar from '@/components/atoms/Avatar'
import { userService } from '@/services'
import UserModal from '@/components/molecules/UserModal'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="agent">Agent</option>
          </select>
          <Button icon="Plus" onClick={handleAddUser}>
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-surface-700">User</th>
                <th className="text-left py-3 px-4 font-medium text-surface-700">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-surface-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-surface-700">Status</th>
                <th className="text-center py-3 px-4 font-medium text-surface-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-surface-100 hover:bg-surface-50"
                  >
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
                          onClick={() => handleEditUser(user)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Trash2"
                          onClick={() => handleDeleteUser(user.Id)}
                          className="text-error hover:text-error"
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="Users" size={48} className="text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 mb-2">No users found</h3>
            <p className="text-surface-600">
              {searchQuery || filterRole !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first user'
              }
            </p>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  )
}

export default Users