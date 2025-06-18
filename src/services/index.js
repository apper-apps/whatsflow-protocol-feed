// Import all services into local scope
import contactService from './api/contactService.js'
import templateService from './api/templateService.js'
import conversationService from './api/conversationService.js'
import messageService from './api/messageService.js'
import chatbotFlowService from './api/chatbotFlowService.js'

// Export as defaults (for backward compatibility)
export { default as contactService } from './api/contactService.js'
export { default as templateService } from './api/templateService.js'
export { default as conversationService } from './api/conversationService.js'
export { default as messageService } from './api/messageService.js'
export { default as chatbotFlowService } from './api/chatbotFlowService.js'

// Export with aliases (now properly referencing imported services)
export {
  contactService as contactAPI,
  templateService as templateAPI,
  conversationService as conversationAPI,
  messageService as messageAPI,
  chatbotFlowService as chatbotFlowAPI
}