import mockClients from '../mockData/clients.json'

let clientsData = [...mockClients]
let nextId = Math.max(...clientsData.map(c => c.Id)) + 1

const clientService = {
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...clientsData])
      }, 300)
    })
  },

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const parsedId = parseInt(id)
        if (isNaN(parsedId)) {
          reject(new Error('Invalid ID: must be an integer'))
          return
        }
        
        const client = clientsData.find(c => c.Id === parsedId)
        if (client) {
          resolve({ ...client })
        } else {
          reject(new Error('Client not found'))
        }
      }, 300)
    })
  },

  async create(clientData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newClient = {
          ...clientData,
          Id: nextId++,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        clientsData.push(newClient)
        resolve({ ...newClient })
      }, 300)
    })
  },

  async update(id, clientData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const parsedId = parseInt(id)
        if (isNaN(parsedId)) {
          reject(new Error('Invalid ID: must be an integer'))
          return
        }

        const index = clientsData.findIndex(c => c.Id === parsedId)
        if (index !== -1) {
          const updatedClient = {
            ...clientsData[index],
            ...clientData,
            Id: parsedId,
            updatedAt: new Date().toISOString()
          }
          clientsData[index] = updatedClient
          resolve({ ...updatedClient })
        } else {
          reject(new Error('Client not found'))
        }
      }, 300)
    })
  },

  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const parsedId = parseInt(id)
        if (isNaN(parsedId)) {
          reject(new Error('Invalid ID: must be an integer'))
          return
        }

        const index = clientsData.findIndex(c => c.Id === parsedId)
        if (index !== -1) {
          clientsData.splice(index, 1)
          resolve()
        } else {
          reject(new Error('Client not found'))
        }
      }, 300)
    })
  }
}

export default clientService