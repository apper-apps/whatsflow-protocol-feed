import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { contactService } from '@/services'
import { toast } from 'react-toastify'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'

const LeadDetailsPanel = ({ conversation, onClose }) => {
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [activities, setActivities] = useState([])

  useEffect(() => {
    if (conversation?.contactId) {
      loadContactDetails()
      loadActivities()
    }
  }, [conversation])

  const loadContactDetails = async () => {
    setLoading(true)
    try {
      const contactData = await contactService.getById(conversation.contactId)
      setContact(contactData)
      setFormData({
        leadStage: contactData.leadStatus || 'new',
        source: contactData.source || '',
        priority: contactData.priority || 'medium',
        notes: contactData.notes || '',
        tags: contactData.tags || []
      })
    } catch (err) {
      toast.error('Failed to load contact details')
    } finally {
      setLoading(false)
    }
  }

  const loadActivities = async () => {
    try {
      // Mock activity data - would come from service in real implementation
      setActivities([
        {
          id: 1,
          type: 'message',
          description: 'Customer sent initial inquiry',
          timestamp: '2024-01-15T10:30:00Z',
          agent: 'System'
        },
        {
          id: 2,
          type: 'status_change',
          description: 'Lead status changed to contacted',
          timestamp: '2024-01-15T09:15:00Z',
          agent: 'Agent 1'
        },
        {
          id: 3,
          type: 'call',
          description: 'Follow-up call completed',
          timestamp: '2024-01-14T16:45:00Z',
          agent: 'Agent 1'
        }
      ])
    } catch (err) {
      console.error('Failed to load activities:', err)
    }
  }

  const handleSave = async () => {
    try {
      const updatedContact = await contactService.update(contact.Id, {
        leadStatus: formData.leadStage,
        source: formData.source,
        priority: formData.priority,
        notes: formData.notes,
        tags: formData.tags
      })
      setContact(updatedContact)
      setEditing(false)
      toast.success('Lead details updated successfully')
    } catch (err) {
      toast.error('Failed to update lead details')
    }
  }

  const getLeadScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'message': return 'MessageSquare'
      case 'call': return 'Phone'
      case 'email': return 'Mail'
      case 'status_change': return 'GitBranch'
      case 'note': return 'FileText'
      default: return 'Activity'
    }
  }

  if (loading) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-surface-500">Loading contact details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-surface-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-surface-900">Lead Details</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={editing ? "X" : "Edit"}
              onClick={() => setEditing(!editing)}
            />
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={onClose}
                className="xl:hidden"
              />
            )}
          </div>
        </div>
        
        {/* Customer Info */}
        {contact && (
          <div className="flex items-center gap-3">
            <Avatar name={contact.name} size="lg" />
            <div>
              <h4 className="font-medium text-surface-900">{contact.name}</h4>
              <p className="text-sm text-surface-600">{contact.phone}</p>
              <p className="text-sm text-surface-600">{contact.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Lead Score */}
        <div className="bg-surface-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-surface-900">Lead Score</h5>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLeadScoreColor(contact?.leadScore || 65)}`}>
              {contact?.leadScore || 65}/100
            </div>
          </div>
          <div className="w-full bg-surface-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${contact?.leadScore || 65}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-surface-900">5</div>
            <div className="text-sm text-surface-600">Messages</div>
          </div>
          <div className="bg-surface-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-surface-900">2</div>
            <div className="text-sm text-surface-600">Days Active</div>
          </div>
        </div>

        {/* Lead Information Form */}
        <div className="space-y-4">
          <h5 className="font-medium text-surface-900 flex items-center gap-2">
            <ApperIcon name="User" size={16} />
            Lead Information
          </h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Lead Stage</label>
              {editing ? (
                <select
                  value={formData.leadStage}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadStage: e.target.value }))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="closed">Closed Won</option>
                  <option value="lost">Closed Lost</option>
                </select>
              ) : (
                <Badge variant="primary" size="sm">
                  {formData.leadStage}
                </Badge>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Source</label>
              {editing ? (
                <Input
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="e.g., Website, Referral, Ad Campaign"
                />
              ) : (
                <p className="text-sm text-surface-900">{formData.source || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Priority</label>
              {editing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <Badge variant={formData.priority === 'high' ? 'error' : formData.priority === 'medium' ? 'warning' : 'success'} size="sm">
                  {formData.priority}
                </Badge>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Notes</label>
              {editing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this lead..."
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 h-20 resize-none"
                />
              ) : (
                <p className="text-sm text-surface-900">{formData.notes || 'No notes added'}</p>
              )}
            </div>

            {editing && (
              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <h5 className="font-medium text-surface-900 flex items-center gap-2">
            <ApperIcon name="Tag" size={16} />
            Tags
          </h5>
          <div className="flex flex-wrap gap-2">
            {(contact?.tags || []).map((tag, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {(!contact?.tags || contact.tags.length === 0) && (
              <span className="text-sm text-surface-500">No tags assigned</span>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3">
          <h5 className="font-medium text-surface-900 flex items-center gap-2">
            <ApperIcon name="Clock" size={16} />
            Recent Activity
          </h5>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center">
                  <ApperIcon name={getActivityIcon(activity.type)} size={14} className="text-surface-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-900">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-surface-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs text-surface-400">•</span>
                    <span className="text-xs text-surface-500">{activity.agent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-surface-200">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon="Phone" className="flex-1">
            Call
          </Button>
          <Button variant="outline" size="sm" icon="Mail" className="flex-1">
            Email
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LeadDetailsPanel