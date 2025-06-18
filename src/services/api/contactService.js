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
.map(c => ({...c}))
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

  async bulkAssign(contactIds, agentName) {
    await delay(400)
    const updatedContacts = []
    
    for (const id of contactIds) {
      const index = this.contacts.findIndex(c => c.Id === parseInt(id, 10))
      if (index !== -1) {
        this.contacts[index].assignedTo = agentName
        updatedContacts.push({...this.contacts[index]})
      }
    }
    
    return updatedContacts
  }

  async filterContacts(filters) {
    await delay(300)
    let filtered = [...this.contacts]

    if (filters.status) {
      filtered = filtered.filter(c => c.leadStatus === filters.status)
    }

    if (filters.agent) {
      filtered = filtered.filter(c => c.assignedTo === filters.agent)
    }

    if (filters.priority) {
      filtered = filtered.filter(c => c.priority === filters.priority)
    }

    if (filters.tags) {
      const tagQuery = filters.tags.toLowerCase()
      filtered = filtered.filter(c => 
        c.tags?.some(tag => tag.toLowerCase().includes(tagQuery))
      )
    }

    if (filters.dateRange) {
      const now = new Date()
      let startDate

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          break
        default:
          startDate = null
      }

      if (startDate) {
        filtered = filtered.filter(c => new Date(c.createdAt) >= startDate)
      }
    }

    return filtered.map(c => ({...c}))
  }

  async exportToCSV() {
    await delay(200)
    return this.contacts.map(contact => ({
      Name: contact.name,
      Phone: contact.phone,
      Email: contact.email || '',
      Status: contact.leadStatus,
      'Assigned To': contact.assignedTo,
      Tags: contact.tags?.join(', ') || '',
      Priority: contact.priority,
      'Created Date': new Date(contact.createdAt).toLocaleDateString(),
      'Last Message': new Date(contact.lastMessageAt).toLocaleDateString(),
      Notes: contact.notes || ''
    }))
  }

  async importFromCSV(csvData) {
    await delay(500)
    const imported = []
    
    for (const row of csvData) {
      if (row.Name && row.Phone) {
        const contactData = {
          name: row.Name,
          phone: row.Phone,
          email: row.Email || '',
          leadStatus: row.Status || 'new',
          assignedTo: row['Assigned To'] || '',
          tags: row.Tags ? row.Tags.split(',').map(tag => tag.trim()) : [],
          priority: row.Priority || 'medium',
          notes: row.Notes || ''
        }
        
        const newContact = await this.create(contactData)
        imported.push(newContact)
      }
    }
    
    return imported
  }

  async getPaginated(page = 1, limit = 10, filters = {}) {
    await delay(300)
    let filtered = await this.filterContacts(filters)
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filtered.slice(startIndex, endIndex)
    
    return {
      data: paginatedData,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      currentPage: page,
      hasNextPage: endIndex < filtered.length,
      hasPrevPage: page > 1
    }
  }
}

export default new ContactService()