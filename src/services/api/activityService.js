import activitiesData from '../mockData/activities.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ActivityService {
  constructor() {
    this.activities = [...activitiesData]
  }

  async getAll() {
    await delay(300)
    return [...this.activities]
  }

  async getById(id) {
    await delay(200)
    const activity = this.activities.find(a => a.Id === parseInt(id, 10))
    return activity ? {...activity} : null
  }

  async getByContactId(contactId) {
    await delay(250)
    return this.activities
      .filter(a => a.contactId === parseInt(contactId, 10))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(a => ({...a}))
  }

  async getByConversationId(conversationId) {
    await delay(250)
    return this.activities
      .filter(a => a.conversationId === parseInt(conversationId, 10))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(a => ({...a}))
  }

  async create(activityData) {
    await delay(400)
    const maxId = Math.max(...this.activities.map(a => a.Id), 0)
    const newActivity = {
      ...activityData,
      Id: maxId + 1,
      timestamp: activityData.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    this.activities.push(newActivity)
    return {...newActivity}
  }

  async update(id, data) {
    await delay(300)
    const index = this.activities.findIndex(a => a.Id === parseInt(id, 10))
    if (index === -1) return null
    
    const updatedActivity = {
      ...this.activities[index],
      ...data,
      Id: this.activities[index].Id, // Prevent Id modification
      updatedAt: new Date().toISOString()
    }
    this.activities[index] = updatedActivity
    return {...updatedActivity}
  }

  async delete(id) {
    await delay(300)
    const index = this.activities.findIndex(a => a.Id === parseInt(id, 10))
    if (index === -1) return false
    
    this.activities.splice(index, 1)
    return true
  }

  async filterByType(type) {
    await delay(200)
    return this.activities
      .filter(a => a.type === type)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(a => ({...a}))
  }

  async filterByDateRange(startDate, endDate) {
    await delay(250)
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return this.activities
      .filter(a => {
        const activityDate = new Date(a.timestamp)
        return activityDate >= start && activityDate <= end
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(a => ({...a}))
  }

  async addCallActivity(contactId, conversationId, callData) {
    await delay(300)
    return this.create({
      type: 'call',
      contactId: parseInt(contactId, 10),
      conversationId: conversationId ? parseInt(conversationId, 10) : null,
      title: callData.title || 'Phone Call',
      description: callData.description || 'Phone call completed',
      details: {
        duration: callData.duration || '0:00',
        outcome: callData.outcome || 'completed',
        notes: callData.notes || '',
        phoneNumber: callData.phoneNumber || ''
      },
      agent: callData.agent || 'Current Agent',
      priority: callData.priority || 'medium'
    })
  }

  async addTicketActivity(contactId, conversationId, ticketData) {
    await delay(300)
    return this.create({
      type: 'ticket',
      contactId: parseInt(contactId, 10),
      conversationId: conversationId ? parseInt(conversationId, 10) : null,
      title: ticketData.title || 'Support Ticket',
      description: ticketData.description || 'Support ticket created',
      details: {
        ticketId: ticketData.ticketId || `TK-${Date.now()}`,
        category: ticketData.category || 'general',
        status: ticketData.status || 'open',
        priority: ticketData.priority || 'medium',
        resolution: ticketData.resolution || ''
      },
      agent: ticketData.agent || 'Current Agent',
      priority: ticketData.priority || 'medium'
    })
  }

  async addChatActivity(contactId, conversationId, chatData) {
    await delay(300)
    return this.create({
      type: 'chat',
      contactId: parseInt(contactId, 10),
      conversationId: conversationId ? parseInt(conversationId, 10) : null,
      title: chatData.title || 'Chat Session',
      description: chatData.description || 'Chat session completed',
      details: {
        platform: chatData.platform || 'whatsapp',
        messageCount: chatData.messageCount || 0,
        duration: chatData.duration || '0:00',
        resolved: chatData.resolved || false,
        summary: chatData.summary || ''
      },
      agent: chatData.agent || 'Current Agent',
      priority: chatData.priority || 'medium'
    })
  }

  async addNoteActivity(contactId, conversationId, noteData) {
    await delay(300)
    return this.create({
      type: 'note',
      contactId: parseInt(contactId, 10),
      conversationId: conversationId ? parseInt(conversationId, 10) : null,
      title: noteData.title || 'Follow-up Note',
      description: noteData.description || 'Follow-up note added',
      details: {
        content: noteData.content || '',
        category: noteData.category || 'general',
        followUpDate: noteData.followUpDate || null,
        isFollowUpRequired: noteData.isFollowUpRequired || false
      },
      agent: noteData.agent || 'Current Agent',
      priority: noteData.priority || 'medium'
    })
  }

  async getActivityStats(contactId) {
    await delay(200)
    const contactActivities = await this.getByContactId(contactId)
    
    const stats = {
      total: contactActivities.length,
      calls: contactActivities.filter(a => a.type === 'call').length,
      tickets: contactActivities.filter(a => a.type === 'ticket').length,
      chats: contactActivities.filter(a => a.type === 'chat').length,
      notes: contactActivities.filter(a => a.type === 'note').length,
      lastActivity: contactActivities.length > 0 ? contactActivities[0].timestamp : null
    }
    
    return stats
  }
}

export default new ActivityService()