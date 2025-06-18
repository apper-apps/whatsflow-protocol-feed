import conversationsData from '../mockData/conversations.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ConversationService {
  constructor() {
    this.conversations = [...conversationsData]
  }

  async getAll() {
    await delay(300)
    return [...this.conversations]
  }

  async getById(id) {
    await delay(200)
    const conversation = this.conversations.find(c => c.Id === parseInt(id, 10))
    return conversation ? {...conversation} : null
  }

  async create(conversationData) {
    await delay(400)
    const maxId = Math.max(...this.conversations.map(c => c.Id), 0)
    const newConversation = {
      ...conversationData,
      Id: maxId + 1,
      updatedAt: new Date().toISOString(),
      messages: []
    }
    this.conversations.push(newConversation)
    return {...newConversation}
  }

  async update(id, data) {
    await delay(300)
    const index = this.conversations.findIndex(c => c.Id === parseInt(id, 10))
    if (index === -1) return null
    
    const updatedConversation = {
      ...this.conversations[index],
      ...data,
      Id: this.conversations[index].Id, // Prevent Id modification
      updatedAt: new Date().toISOString()
    }
    this.conversations[index] = updatedConversation
    return {...updatedConversation}
  }

  async delete(id) {
    await delay(300)
    const index = this.conversations.findIndex(c => c.Id === parseInt(id, 10))
    if (index === -1) return false
    
    this.conversations.splice(index, 1)
    return true
  }

async getByStatus(status) {
    await delay(250)
    return this.conversations.filter(c => c.status === status).map(c => ({...c}))
  }

  async updateStatus(id, status) {
    await delay(200)
    return this.update(id, { status })
  }

  async assignAgent(id, agentName) {
    await delay(200)
    return this.update(id, { assignedTo: agentName })
  }

  async addActivity(conversationId, activity) {
    await delay(200)
    const conversation = this.conversations.find(c => c.Id === parseInt(conversationId, 10))
    if (!conversation) return null
    
    if (!conversation.activities) conversation.activities = []
    conversation.activities.push({
      ...activity,
      id: Date.now(),
      timestamp: new Date().toISOString()
    })
    
    return {...conversation}
  }

  async getActivities(conversationId) {
    await delay(200)
    const conversation = this.conversations.find(c => c.Id === parseInt(conversationId, 10))
    return conversation?.activities || []
  }
}

export default new ConversationService()