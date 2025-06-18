import mockData from '../mockData/chatbotFlows.json'

const flows = [...mockData]
let nextId = flows.length > 0 ? Math.max(...flows.map(f => f.id)) + 1 : 1

export const getAll = () => {
  return Promise.resolve(flows)
}

export const getById = (id) => {
  const flow = flows.find(f => f.id === parseInt(id))
  return flow ? Promise.resolve(flow) : Promise.reject(new Error('Flow not found'))
}

export const create = (flowData) => {
  const newFlow = {
    id: nextId++,
    ...flowData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  flows.push(newFlow)
  return Promise.resolve(newFlow)
}

export const update = (id, updates) => {
  const index = flows.findIndex(f => f.id === parseInt(id))
  if (index === -1) {
    return Promise.reject(new Error('Flow not found'))
  }
  flows[index] = {
    ...flows[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  return Promise.resolve(flows[index])
}

export const delete_ = (id) => {
  const index = flows.findIndex(f => f.id === parseInt(id))
  if (index === -1) {
    return Promise.reject(new Error('Flow not found'))
  }
  const deletedFlow = flows.splice(index, 1)[0]
  return Promise.resolve(deletedFlow)
}
// Default export - service object with all methods
const chatbotFlowService = {
  getAll,
  getById,
  create,
  update,
  delete: delete_,
  delete_
}

export default chatbotFlowService