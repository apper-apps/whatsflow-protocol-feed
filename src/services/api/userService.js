import mockData from '../mockData/users.json'

let users = [...mockData]
let nextId = Math.max(...users.map(u => u.Id)) + 1

const userService = {
  // Get all users
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...users])
      }, 300)
    })
  },

  // Get user by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.Id === parseInt(id))
        if (user) {
          resolve({ ...user })
        } else {
          reject(new Error('User not found'))
        }
      }, 200)
    })
  },

  // Create new user
  create: (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          Id: nextId++,
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        users.unshift(newUser)
        resolve({ ...newUser })
      }, 400)
    })
  },

  // Update user
  update: (id, userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.Id === parseInt(id))
        if (index !== -1) {
          users[index] = {
            ...users[index],
            ...userData,
            updatedAt: new Date().toISOString()
          }
          resolve({ ...users[index] })
        } else {
          reject(new Error('User not found'))
        }
      }, 400)
    })
  },

  // Delete user
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.Id === parseInt(id))
        if (index !== -1) {
          const deletedUser = users.splice(index, 1)[0]
          resolve(deletedUser)
        } else {
          reject(new Error('User not found'))
        }
      }, 300)
    })
  }
}

export default userService