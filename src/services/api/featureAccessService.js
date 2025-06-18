import mockFeatures from '../mockData/featureAccess.json'

let featuresData = [...mockFeatures]
let nextId = Math.max(...featuresData.map(f => f.Id)) + 1

const featureAccessService = {
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...featuresData])
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
        
        const feature = featuresData.find(f => f.Id === parsedId)
        if (feature) {
          resolve({ ...feature })
        } else {
          reject(new Error('Feature not found'))
        }
      }, 300)
    })
  },

  async create(featureData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFeature = {
          ...featureData,
          Id: nextId++,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        featuresData.push(newFeature)
        resolve({ ...newFeature })
      }, 300)
    })
  },

  async update(id, featureData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const parsedId = parseInt(id)
        if (isNaN(parsedId)) {
          reject(new Error('Invalid ID: must be an integer'))
          return
        }

        const index = featuresData.findIndex(f => f.Id === parsedId)
        if (index !== -1) {
          const updatedFeature = {
            ...featuresData[index],
            ...featureData,
            Id: parsedId,
            updatedAt: new Date().toISOString()
          }
          featuresData[index] = updatedFeature
          resolve({ ...updatedFeature })
        } else {
          reject(new Error('Feature not found'))
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

        const index = featuresData.findIndex(f => f.Id === parsedId)
        if (index !== -1) {
          featuresData.splice(index, 1)
          resolve()
        } else {
          reject(new Error('Feature not found'))
        }
      }, 300)
    })
  },

  async getUserFeatures(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userFeatures = featuresData.filter(f => 
          f.isEnabled && f.userIds && f.userIds.includes(userId)
        )
        resolve([...userFeatures])
      }, 300)
    })
  },

  async assignFeatureToUser(featureId, userId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const parsedFeatureId = parseInt(featureId)
        const parsedUserId = parseInt(userId)
        
        if (isNaN(parsedFeatureId) || isNaN(parsedUserId)) {
          reject(new Error('Invalid IDs: must be integers'))
          return
        }

        const feature = featuresData.find(f => f.Id === parsedFeatureId)
        if (feature) {
          if (!feature.userIds) {
            feature.userIds = []
          }
          if (!feature.userIds.includes(parsedUserId)) {
            feature.userIds.push(parsedUserId)
            feature.updatedAt = new Date().toISOString()
            resolve({ ...feature })
          } else {
            reject(new Error('User already has this feature'))
          }
        } else {
          reject(new Error('Feature not found'))
        }
      }, 300)
    })
  },

  async removeFeatureFromUser(featureId, userId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const parsedFeatureId = parseInt(featureId)
        const parsedUserId = parseInt(userId)
        
        if (isNaN(parsedFeatureId) || isNaN(parsedUserId)) {
          reject(new Error('Invalid IDs: must be integers'))
          return
        }

        const feature = featuresData.find(f => f.Id === parsedFeatureId)
        if (feature && feature.userIds) {
          const userIndex = feature.userIds.indexOf(parsedUserId)
          if (userIndex !== -1) {
            feature.userIds.splice(userIndex, 1)
            feature.updatedAt = new Date().toISOString()
            resolve({ ...feature })
          } else {
            reject(new Error('User does not have this feature'))
          }
        } else {
          reject(new Error('Feature not found'))
        }
      }, 300)
    })
  }
}

export default featureAccessService