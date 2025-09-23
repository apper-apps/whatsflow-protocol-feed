import mockData from "../mockData/billing.json";
import React from "react";

let billingData = { ...mockData }

const billingService = {
  // Get subscription info
  getSubscription: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...billingData.subscription })
      }, 300)
    })
  },

  // Get all invoices
  getInvoices: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...billingData.invoices])
      }, 250)
    })
  },

  // Get payment methods
  getPaymentMethods: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...billingData.paymentMethods])
      }, 200)
    })
  },

  // Cancel subscription
  cancelSubscription: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        billingData.subscription.status = 'cancelled'
        billingData.subscription.cancelledAt = new Date().toISOString()
        resolve({ ...billingData.subscription })
      }, 500)
    })
  },

  // Download invoice
  downloadInvoice: (invoiceId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const invoice = billingData.invoices.find(inv => inv.Id === parseInt(invoiceId))
        if (invoice) {
          // Simulate download
          resolve({ success: true, url: `/invoices/${invoice.number}.pdf` })
        } else {
          reject(new Error('Invoice not found'))
        }
      }, 300)
    })
  },

  // Add payment method
  addPaymentMethod: (paymentMethodData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPaymentMethod = {
          Id: Math.max(...billingData.paymentMethods.map(pm => pm.Id)) + 1,
          ...paymentMethodData,
          createdAt: new Date().toISOString()
        }
        billingData.paymentMethods.push(newPaymentMethod)
        resolve({ ...newPaymentMethod })
      }, 400)
    })
  },

  // Delete payment method
// Delete payment method
  deletePaymentMethod: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = billingData.paymentMethods.findIndex(pm => pm.Id === parseInt(id))
        if (index !== -1) {
          const deletedMethod = billingData.paymentMethods.splice(index, 1)[0]
          resolve(deletedMethod)
        } else {
          reject(new Error('Payment method not found'))
        }
      }, 300)
    })
  },
  // Calculate plan total with credits
  calculatePlanTotal: (planType, creditQuantities) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rates = {
          monthly: { platform: 800, marketing: 0.88, authentication: 0.13, utility: 0.13 },
          halfYearly: { platform: 600, marketing: 0.88, authentication: 0.13, utility: 0.13 },
          yearly: { platform: 400, marketing: 0.88, authentication: 0.13, utility: 0.13 }
        }
        
        const planRates = rates[planType]
        if (!planRates) {
          resolve({ error: 'Invalid plan type' })
          return
        }
        
        const creditsTotal = (creditQuantities.marketing * planRates.marketing) + 
                           (creditQuantities.authentication * planRates.authentication) + 
                           (creditQuantities.utility * planRates.utility)
        
        resolve({
          platform: planRates.platform,
          credits: creditsTotal,
          total: planRates.platform + creditsTotal,
          breakdown: {
            marketing: creditQuantities.marketing * planRates.marketing,
            authentication: creditQuantities.authentication * planRates.authentication,
            utility: creditQuantities.utility * planRates.utility,
services: 0
          }
        })
      }, 200)
    })
},

  // Get service usage data
  async getServiceUsage() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockData.serviceUsage };
    } catch (error) {
      throw new Error('Failed to fetch service usage');
    }
  },

  // Get credit balances
  async getCreditBalances() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockData.creditBalances };
    } catch (error) {
      throw new Error('Failed to fetch credit balances');
    }
  },

  // Get validity periods
  async getValidityPeriods() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockData.validityPeriods };
    } catch (error) {
      throw new Error('Failed to fetch validity periods');
    }
  }
}

export default billingService