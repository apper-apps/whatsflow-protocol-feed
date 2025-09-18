import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { contactService, conversationService } from "@/services";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Avatar from "@/components/atoms/Avatar";
import MessageThread from "@/components/organisms/MessageThread";
import { getById, update } from "@/services/api/chatbotFlowService";

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
      // Validate required fields
      if (!formData.leadStage) {
        toast.error('Lead stage is required')
        return
      }

      const oldStage = contact.leadStatus
      const updatedContact = await contactService.update(contact.Id, {
        leadStatus: formData.leadStage,
        source: formData.source,
        priority: formData.priority,
        notes: formData.notes,
        tags: formData.tags
      })
      
      setContact(updatedContact)
      setEditing(false)
      
      // Log stage change activity if stage changed
      if (oldStage !== formData.leadStage && conversation?.Id) {
        try {
          await conversationService.addStatusChangeActivity(conversation.Id, {
            type: 'lead_stage_change',
            description: `Lead stage changed from ${oldStage} to ${formData.leadStage}`,
            oldStage,
            newStage: formData.leadStage,
            agent: 'Current Agent' // Would come from auth context
          })
        } catch (err) {
          console.error('Failed to log stage change:', err)
        }
      }
      
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

  const getActivityColor = (type) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600'
      case 'call': return 'bg-green-100 text-green-600'
      case 'email': return 'bg-purple-100 text-purple-600'
      case 'status_change': return 'bg-orange-100 text-orange-600'
      case 'note': return 'bg-gray-100 text-gray-600'
      case 'chat': return 'bg-indigo-100 text-indigo-600'
      case 'ticket': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
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
      {/* Panel Header */}
      <div className="p-6 border-b border-surface-200 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-surface-900">Lead Details</h3>
            <p className="text-sm text-surface-600 mt-1">Manage lead information and activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={editing ? "outline" : "ghost"}
              size="sm"
              icon={editing ? "X" : "Edit"}
              onClick={() => setEditing(!editing)}
              className={editing ? "text-red-600 hover:text-red-700 border-red-200" : "text-surface-600 hover:text-surface-900"}
            >
              {editing ? "Cancel" : "Edit"}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={onClose}
                className="xl:hidden text-surface-600 hover:text-surface-900"
              />
            )}
          </div>
        </div>
        
        {/* Contact Overview */}
        {contact && (
          <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
            <Avatar name={contact.name} size="xl" className="ring-2 ring-white shadow-sm" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-surface-900">{contact.name}</h4>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-surface-600 flex items-center gap-2">
                  <ApperIcon name="Phone" size={14} />
                  {contact.phone}
                </p>
                <p className="text-sm text-surface-600 flex items-center gap-2">
                  <ApperIcon name="Mail" size={14} />
                  {contact.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Lead Score Section */}
        <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                    <ApperIcon name="Target" size={18} />
                    Lead Score
                </h5>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getLeadScoreColor(contact?.leadScore || 65)}`}>
                    {contact?.leadScore || 65}/100
                </div>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-3">
                <div
                    className="bg-gradient-to-r from-primary to-green-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${contact?.leadScore || 65}%` }}
                />
            </div>
        </div>
        {/* Quick Stats */}
{/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-sm text-center">
                <div className="text-3xl font-bold text-primary mb-1">5</div>
                <div className="text-sm font-medium text-surface-600">Messages</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">2</div>
                <div className="text-sm font-medium text-surface-600">Days Active</div>
            </div>
        </div>
        {/* Lead Information Form */}
{/* Lead Information Section */}
        <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-sm">
            <h5 className="text-lg font-semibold text-surface-900 flex items-center gap-2 mb-6">
                <ApperIcon name="User" size={18} />
                Lead Information
            </h5>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lead Stage */}
                    <div>
                        <label className="block text-sm font-medium text-surface-900 mb-3">Lead Stage</label>
                        {editing ? (
                            <select
                                value={formData.leadStage}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    leadStage: e.target.value
                                }))}
                                className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                            >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="converted">Converted</option>
                            </select>
                        ) : (
                            <div className="flex items-center">
                                <Badge
                                    variant={formData.leadStage === "converted" ? "success" : formData.leadStage === "qualified" ? "warning" : formData.leadStage === "contacted" ? "info" : "error"}
                                    className="px-3 py-1"
                                >
                                    {formData.leadStage === "new" ? "New Lead" : formData.leadStage === "contacted" ? "Contacted" : formData.leadStage === "qualified" ? "Qualified" : formData.leadStage === "converted" ? "Converted" : formData.leadStage}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-surface-900 mb-3">Priority</label>
                        {editing ? (
                            <select
                                value={formData.priority}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    priority: e.target.value
                                }))}
                                className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        ) : (
                            <Badge
                                variant={formData.priority === "high" ? "error" : formData.priority === "medium" ? "warning" : "success"}
                                className="px-3 py-1 capitalize"
                            >
                                {formData.priority}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Source */}
                <div>
                    <label className="block text-sm font-medium text-surface-900 mb-3">Source</label>
                    {editing ? (
                        <Input
                            value={formData.source}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                source: e.target.value
                            }))}
                            placeholder="e.g., Ad Campaign, Referral, Website"
                            className="w-full"
                        />
                    ) : (
                        <p className="text-sm text-surface-900 bg-surface-50 px-4 py-3 rounded-lg border border-surface-200">
                            {formData.source || "Not specified"}
                        </p>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-surface-900 mb-3">Notes / Call Summary</label>
                    {editing ? (
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                notes: e.target.value
                            }))}
                            placeholder="Add notes about this lead or call summary..."
                            className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-32 resize-none"
                        />
                    ) : (
                        <div className="bg-surface-50 px-4 py-3 rounded-lg min-h-[80px] border border-surface-200">
                            <p className="text-sm text-surface-900 whitespace-pre-wrap">
                                {formData.notes || "No notes added"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Edit Actions */}
                {editing && (
                    <div className="flex gap-3 pt-4 border-t border-surface-200">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            className="flex-1"
                            icon="Save"
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEditing(false);
                                setFormData({
                                    leadStage: contact?.leadStatus || "new",
                                    source: contact?.source || "",
                                    priority: contact?.priority || "medium",
                                    notes: contact?.notes || "",
                                    tags: contact?.tags || []
                                });
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
</div>
        </div>
        
        {/* Tags Section */}
        <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-sm">
          <h5 className="text-lg font-semibold text-surface-900 flex items-center gap-2 mb-4">
            <ApperIcon name="Tag" size={18} />
            Tags
          </h5>
          <div className="flex flex-wrap gap-2">
            {(contact?.tags || []).map((tag, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {tag}
              </Badge>
            ))}
            {(!contact?.tags || contact.tags.length === 0) && (
              <div className="text-center py-4 text-surface-500">
                <ApperIcon name="Tag" size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tags assigned</p>
              </div>
            )}
          </div>
        </div>
{/* Activity Timeline Section */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-surface-200">
            <h5 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
              <ApperIcon name="Clock" size={18} />
              Activity Timeline
            </h5>
            <Badge variant="secondary" className="px-3 py-1">
              {activities.length} activities
            </Badge>
          </div>
          
          <div className="p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <ApperIcon name="Clock" size={48} className="text-surface-400 mx-auto mb-4 opacity-50" />
                <p className="text-surface-500 font-medium">No activity history available</p>
                <p className="text-surface-400 text-sm mt-1">Activity will appear here as you interact with this lead</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {activities.map(activity => (
                  <motion.div
                    key={activity.id}
                                className="relative border-l-2 border-surface-200 pl-6 pb-6 last:pb-0"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Activity Icon */}
                                <div className={`absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${getActivityColor(activity.type)}`}>
                                    <ApperIcon name={getActivityIcon(activity.type)} size={12} />
                                </div>
                                
                                {/* Activity Content */}
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h6 className="font-medium text-surface-900 flex items-center gap-2">
                                                {activity.title}
                                                {activity.priority && (
                                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(activity.priority) === "text-red-600" ? "bg-red-500" : getPriorityColor(activity.priority) === "text-yellow-600" ? "bg-yellow-500" : "bg-green-500"}`} />
                                                )}
                                            </h6>
                                            <p className="text-sm text-surface-600 mt-1">{activity.description}</p>
                                        </div>
                                        <Badge variant="outline" size="sm" className="capitalize">
                                            {activity.type}
                                        </Badge>
                                    </div>

                                    {/* Activity Details */}
                                    {activity.details && (
                                        <div className="bg-surface-50 rounded-lg p-4 space-y-2 border border-surface-200">
                                            {activity.type === "call" && activity.details.duration && (
                                                <div className="flex items-center gap-2 text-sm text-surface-600">
                                                    <ApperIcon name="Clock" size={14} />
                                                    Duration: {activity.details.duration}
                                                    {activity.details.outcome && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="capitalize">{activity.details.outcome.replace("_", " ")}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {(activity.type === "call" && activity.details.notes || 
                                              activity.type === "chat" && activity.details.summary || 
                                              activity.type === "note" && activity.details.content || 
                                              activity.type === "ticket" && activity.details.resolution) && (
                                                <div className="text-sm text-surface-700 bg-white rounded-lg p-3 border border-surface-200">
                                                    {activity.details.notes || activity.details.summary || activity.details.content || activity.details.resolution}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Activity Meta */}
                                    <div className="flex items-center gap-2 text-sm text-surface-500">
                                        <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                                        <span>•</span>
                                        <span className="font-medium">{activity.agent}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-surface-200 bg-surface-50">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            icon="Phone" 
            className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
          >
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon="Mail" 
            className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
          >
            Email
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LeadDetailsPanel