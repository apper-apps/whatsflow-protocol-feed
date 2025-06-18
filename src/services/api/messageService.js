import messagesData from '../mockData/messages.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class MessageService {
  constructor() {
    this.messages = [...messagesData]
  }

  async getAll() {
    await delay(300)
    return [...this.messages]
  }

  async getById(id) {
    await delay(200)
    const message = this.messages.find(m => m.Id === parseInt(id, 10))
    return message ? {...message} : null
  }

  async create(messageData) {
    await delay(400)
    const maxId = Math.max(...this.messages.map(m => m.Id), 0)
    const newMessage = {
      ...messageData,
      Id: maxId + 1,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    this.messages.push(newMessage)
    return {...newMessage}
  }

  async update(id, data) {
    await delay(300)
    const index = this.messages.findIndex(m => m.Id === parseInt(id, 10))
    if (index === -1) return null
    
    const updatedMessage = {
      ...this.messages[index],
      ...data,
      Id: this.messages[index].Id // Prevent Id modification
    }
    this.messages[index] = updatedMessage
    return {...updatedMessage}
  }

  async delete(id) {
    await delay(300)
    const index = this.messages.findIndex(m => m.Id === parseInt(id, 10))
    if (index === -1) return false
    
    this.messages.splice(index, 1)
    return true
  }

  async getByConversationId(conversationId) {
    await delay(250)
    return this.messages
      .filter(m => m.conversationId === conversationId)
      .map(m => ({...m}))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  async markAsRead(id) {
    await delay(200)
    return this.update(id, { status: 'read' })
  }
}

export default new MessageService()