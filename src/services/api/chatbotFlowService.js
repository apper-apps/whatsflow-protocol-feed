import mockData from '../mockData/chatbotFlows.json';

let flows = [...mockData];
let nextId = Math.max(...flows.map(f => f.Id)) + 1;

export const getAll = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...flows];
};

export const getById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const parsedId = parseInt(id);
  const flow = flows.find(f => f.Id === parsedId);
  return flow ? { ...flow } : null;
};

export const create = async (flowData) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newFlow = {
    Id: nextId++,
    ...flowData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  flows.push(newFlow);
  return { ...newFlow };
};

export const update = async (id, flowData) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const parsedId = parseInt(id);
  const index = flows.findIndex(f => f.Id === parsedId);
  
  if (index === -1) {
    throw new Error('Flow not found');
  }
  
  flows[index] = {
    ...flows[index],
    ...flowData,
    Id: parsedId,
    updatedAt: new Date().toISOString()
  };
  
  return { ...flows[index] };
};

export const delete_ = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const parsedId = parseInt(id);
  const index = flows.findIndex(f => f.Id === parsedId);
  
  if (index === -1) {
    throw new Error('Flow not found');
  }
  
  flows.splice(index, 1);
  return true;
};

export { delete_ as delete };