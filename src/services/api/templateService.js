import templatesData from '../mockData/templates.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class TemplateService {
  constructor() {
    this.templates = [...templatesData]
  }

  async getAll() {
    await delay(300)
    return [...this.templates]
  }

  async getById(id) {
    await delay(200)
    const template = this.templates.find(t => t.Id === parseInt(id, 10))
    return template ? {...template} : null
  }

  async create(templateData) {
    await delay(400)
    const maxId = Math.max(...this.templates.map(t => t.Id), 0)
    const newTemplate = {
      ...templateData,
      Id: maxId + 1
    }
    this.templates.push(newTemplate)
    return {...newTemplate}
  }

  async update(id, data) {
    await delay(300)
    const index = this.templates.findIndex(t => t.Id === parseInt(id, 10))
    if (index === -1) return null
    
    const updatedTemplate = {
      ...this.templates[index],
      ...data,
      Id: this.templates[index].Id // Prevent Id modification
    }
    this.templates[index] = updatedTemplate
    return {...updatedTemplate}
  }

  async delete(id) {
    await delay(300)
    const index = this.templates.findIndex(t => t.Id === parseInt(id, 10))
    if (index === -1) return false
    
    this.templates.splice(index, 1)
    return true
  }

  async getByCategory(category) {
    await delay(250)
    return this.templates
      .filter(t => t.category === category)
      .map(t => ({...t}))
  }
}

export default new TemplateService()