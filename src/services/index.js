import conversationService from './api/conversationService.js'
import messageService from './api/messageService.js'
import contactService from './api/contactService.js'
import templateService from './api/templateService.js'
import userService from './api/userService.js'
import clientService from './api/clientService.js'
import featureAccessService from './api/featureAccessService.js'
import billingService from './api/billingService.js'
import chatbotFlowService from './api/chatbotFlowService.js'

// Export all services in a single, clean export block
export {
  conversationService,
  messageService,
  contactService,
  templateService,
  userService,
  clientService,
  featureAccessService,
  billingService,
  chatbotFlowService
}

// Export aliases for backward compatibility
export { billingService as billingAPI }
export { userService as userAPI }
export { chatbotFlowService as chatbotFlowAPI }