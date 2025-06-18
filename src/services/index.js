// Import all services into local scope
import contactService from './api/contactService.js'
import templateService from './api/templateService.js'
import messageService from './api/messageService.js'
import chatbotFlowService from './api/chatbotFlowService.js'
import conversationService from './api/conversationService.js'
import userService from './api/userService.js'
import billingService from './api/billingService.js'

// Export services with consistent naming
export const contactAPI = contactService
export const templateAPI = templateService
export const conversationAPI = conversationService
export const messageAPI = messageService
export const chatbotFlowAPI = chatbotFlowService
export const userAPI = userService
export const billingAPI = billingService

export {
  contactService,
  templateService,
  conversationService,
  messageService,
  chatbotFlowService,
  userService,
  billingService
}