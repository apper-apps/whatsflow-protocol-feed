import contactsData from '../mockData/contacts.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ContactService {
  constructor() {
    this.contacts = [...contactsData]
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
      lastMessageAt: new Date().toISOString()
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
      Id: this.contacts[index].Id // Prevent Id modification
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
}

export default new ContactService()