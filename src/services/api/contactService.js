import contactsData from '../mockData/contacts.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ContactService {
  constructor() {
    this.contacts = [...contactsData]
    this.teamMembers = [
      { Id: 1, name: 'John Smith', role: 'Sales Manager' },
      { Id: 2, name: 'Sarah Wilson', role: 'Account Executive' },
      { Id: 3, name: 'Mike Johnson', role: 'Support Specialist' },
      { Id: 4, name: 'Emily Davis', role: 'Marketing Lead' }
    ]
  }

  async getAll() {
    await delay(300)
    return [...this.contacts]
  }

  async getById(id) {
    await delay(200)
    const contact = this.contacts.find(c => c.Id === parseInt(id, 10))
    return contact ? {...contact} : null
  }

async create(contactData) {
    await delay(400)
    const maxId = Math.max(...this.contacts.map(c => c.Id), 0)
    const newContact = {
      ...contactData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      leadStatus: contactData.leadStatus || 'new',
      priority: contactData.priority || 'medium',
      assignedTo: contactData.assignedTo || '',
      pipelineStage: contactData.pipelineStage || 'prospecting'
    }
    this.contacts.push(newContact)
    return {...newContact}
  }

async update(id, data) {
    await delay(300)
    const index = this.contacts.findIndex(c => c.Id === parseInt(id, 10))
    if (index === -1) return null
    
    const updatedContact = {
      ...this.contacts[index],
      ...data,
      Id: this.contacts[index].Id, // Prevent Id modification
      leadStatus: data.leadStatus || this.contacts[index].leadStatus || 'new',
      priority: data.priority || this.contacts[index].priority || 'medium',
      assignedTo: data.assignedTo !== undefined ? data.assignedTo : this.contacts[index].assignedTo,
      pipelineStage: data.pipelineStage || this.contacts[index].pipelineStage || 'prospecting'
    }
    this.contacts[index] = updatedContact
    return {...updatedContact}
  }

  async delete(id) {
    await delay(300)
    const index = this.contacts.findIndex(c => c.Id === parseInt(id, 10))
    if (index === -1) return false
    
    this.contacts.splice(index, 1)
    return true
  }

  async searchByName(query) {
    await delay(200)
    const searchQuery = query.toLowerCase()
    return this.contacts
      .filter(c => c.name.toLowerCase().includes(searchQuery))
      .map(c => ({...c}))
  }

  async getByTag(tag) {
    await delay(250)
    return this.contacts
      .filter(c => c.tags.includes(tag))
}

  async getTeamMembers() {
    await delay(200)
    return [...this.teamMembers]
  }

  async updateLeadStatus(id, status) {
    await delay(250)
    const index = this.contacts.findIndex(c => c.Id === parseInt(id, 10))
    if (index === -1) return null
    
    this.contacts[index].leadStatus = status
    return {...this.contacts[index]}
  }

  async assignToTeamMember(id, teamMemberName) {
    await delay(250)
    const index = this.contacts.findIndex(c => c.Id === parseInt(id, 10))
    if (index === -1) return null
    
    this.contacts[index].assignedTo = teamMemberName
    return {...this.contacts[index]}
  }
}

export default new ContactService()