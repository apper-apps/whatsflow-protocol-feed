import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { contactService, conversationService } from "@/services";
import { toast } from "react-toastify";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";

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
    {/* Header */}
    <div className="p-4 border-b border-surface-200">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-900">Lead Details</h3>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    icon={editing ? "X" : "Edit"}
                    onClick={() => setEditing(!editing)} />
                {onClose && <Button
                    variant="ghost"
                    size="sm"
                    icon="X"
                    onClick={onClose}
                    className="xl:hidden" />}
            </div>
        </div>
        {/* Customer Info */}
        {contact && <div className="flex items-center gap-3">
            <Avatar name={contact.name} size="lg" />
            <div>
                <h4 className="font-medium text-surface-900">{contact.name}</h4>
                <p className="text-sm text-surface-600">{contact.phone}</p>
                <p className="text-sm text-surface-600">{contact.email}</p>
            </div>
        </div>}
    </div>
    {/* Content */}
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Lead Score */}
        <div className="bg-surface-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-surface-900">Lead Score</h5>
                <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getLeadScoreColor(contact?.leadScore || 65)}`}>
                    {contact?.leadScore || 65}/100
                                </div>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-2">
                <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                        width: `${contact?.leadScore || 65}%`
                    }} />
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
                <ApperIcon name="User" size={16} />Lead Information
                          </h5>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Lead Stage</label>
                    {editing ? <select
                        value={formData.leadStage}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            leadStage: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                    </select> : <div className="flex items-center gap-2">
                        <Badge
                            variant={formData.leadStage === "converted" ? "success" : formData.leadStage === "qualified" ? "warning" : formData.leadStage === "contacted" ? "info" : "error"}
                            size="sm">
                            {formData.leadStage === "new" ? "New Lead" : formData.leadStage === "contacted" ? "Contacted" : formData.leadStage === "qualified" ? "Qualified" : formData.leadStage === "converted" ? "Converted" : formData.leadStage}
                        </Badge>
                    </div>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Source</label>
                    {editing ? <Input
                        value={formData.source}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            source: e.target.value
                        }))}
                        placeholder="e.g., Ad Campaign, Referral, Website" /> : <p className="text-sm text-surface-900 bg-surface-50 px-3 py-2 rounded-lg">
                        {formData.source || "Not specified"}
                    </p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Priority</label>
                    {editing ? <select
                        value={formData.priority}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            priority: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select> : <Badge
                        variant={formData.priority === "high" ? "error" : formData.priority === "medium" ? "warning" : "success"}
                        size="sm">
                        {formData.priority}
                    </Badge>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Notes / Call Summary</label>
                    {editing ? <textarea
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            notes: e.target.value
                        }))}
                        placeholder="Add notes about this lead or call summary..."
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none" /> : <div className="bg-surface-50 px-3 py-2 rounded-lg min-h-[60px]">
                        <p className="text-sm text-surface-900 whitespace-pre-wrap">
                            {formData.notes || "No notes added"}
                        </p>
                    </div>}
                </div>
                {editing && <div className="flex gap-2 pt-3 border-t border-surface-200">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        className="flex-1"
                        icon="Save">Save Changes
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
                        className="flex-1">Cancel
                                        </Button>
                </div>}
            </div>
        </div>
        {/* Tags */}
        <div className="space-y-3">
            <h5 className="font-medium text-surface-900 flex items-center gap-2">
                <ApperIcon name="Tag" size={16} />Tags
                          </h5>
            <div className="flex flex-wrap gap-2">
                {(contact?.tags || []).map((tag, index) => <Badge key={index} variant="secondary" size="sm">
                    {tag}
                </Badge>)}
                {(!contact?.tags || contact.tags.length === 0) && <span className="text-sm text-surface-500">No tags assigned</span>}
            </div>
        </div>
        {/* Activity Timeline */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-surface-900 flex items-center gap-2">
                    <ApperIcon name="Clock" size={16} />Past Activity Timeline
                                </h5>
<Badge variant="secondary" size="sm">
                    {activities.length} activities
                </Badge>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.length === 0 ? <div className="text-center py-8">
                    <ApperIcon name="Clock" size={32} className="text-surface-400 mx-auto mb-2" />
                    <p className="text-sm text-surface-500">No activity history available</p>
                </div> : activities.map(activity => <motion.div
                    key={activity.Id}
                    className="relative border-l-2 border-surface-200 pl-4 pb-4"
                    initial={{
                        opacity: 0,
                        y: 10
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.2
                    }}>
                    {/* Activity Icon */}
                    <div
                        className={`absolute -left-2 w-4 h-4 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        <ApperIcon name={getActivityIcon(activity.type)} size={10} />
                    </div>
                    {/* Activity Content */}
                    <div className="space-y-2">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h6 className="text-sm font-medium text-surface-900 flex items-center gap-2">
                                    {activity.title}
                                    {activity.priority && <div
                                        className={`w-2 h-2 rounded-full ${getPriorityColor(activity.priority) === "text-red-600" ? "bg-red-500" : getPriorityColor(activity.priority) === "text-yellow-600" ? "bg-yellow-500" : "bg-green-500"}`} />}
                                </h6>
                                <p className="text-sm text-surface-600 mt-1">{activity.description}</p>
                            </div>
                            <Badge variant="outline" size="xs" className="capitalize">
                                {activity.type}
                            </Badge>
                        </div>
                        {/* Activity Details */}
                        {activity.details && <div className="bg-surface-50 rounded-lg p-3 space-y-2">
                            {activity.type === "call" && activity.details.duration && <div className="flex items-center gap-2 text-xs text-surface-600">
                                <ApperIcon name="Clock" size={12} />Duration: {activity.details.duration}
                                {activity.details.outcome && <>
                                    <span>•</span>
                                    <span className="capitalize">{activity.details.outcome.replace("_", " ")}</span>
                                </>}
                            </div>}
                            {activity.type === "ticket" && activity.details.ticketId && <div className="flex items-center gap-2 text-xs text-surface-600">
                                <ApperIcon name="Hash" size={12} />
                                {activity.details.ticketId}
                                {activity.details.status && <>
                                    <span>•</span>
                                    <Badge variant="outline" size="xs" className="capitalize">
                                        {activity.details.status.replace("_", " ")}
                                    </Badge>
                                </>}
                            </div>}
                            {activity.type === "chat" && activity.details.platform && <div className="flex items-center gap-2 text-xs text-surface-600">
                                <ApperIcon name="MessageSquare" size={12} />
                                {activity.details.platform}
                                {activity.details.messageCount && <>
{activity.details.messageCount} messages
                                </>}
                            </div>}
                            </div>}
                            {activity.type === "note" && activity.details.category && <div className="flex items-center gap-2 text-xs text-surface-600">
                                <ApperIcon name="Tag" size={12} />
                                <span className="capitalize">{activity.details.category.replace("_", " ")}</span>
                                {activity.details.isFollowUpRequired && <>
                                    <span>•</span>
                                    <span className="text-orange-600">Follow-up required</span>
                                </>}
                            </div>}
                            {(activity.type === "call" && activity.details.notes || activity.type === "chat" && activity.details.summary || activity.type === "note" && activity.details.content || activity.type === "ticket" && activity.details.resolution) && <div
                                className="text-xs text-surface-700 bg-white rounded p-2 border border-surface-200">
                                {activity.details.notes || activity.details.summary || activity.details.content || activity.details.resolution}
                            </div>}
                        </div>}
                        {/* Activity Meta */}
                        <div className="flex items-center gap-2 text-xs text-surface-500">
                            <span>{formatDistanceToNow(new Date(activity.timestamp), {
                                    addSuffix: true
                                })}</span>
                            <span>•</span>
                            <span>{activity.agent}</span>
                        </div>
                    </div>
                </motion.div>)}
            </div>
        </div>
    </div>
    {/* Footer Actions */}
    <div className="p-4 border-t border-surface-200">
        <div className="flex gap-2">
            <Button variant="outline" size="sm" icon="Phone" className="flex-1">Call
                          </Button>
            <Button variant="outline" size="sm" icon="Mail" className="flex-1">Email
                          </Button>
        </div>
    </div>
</div>
  )
}

export default LeadDetailsPanel