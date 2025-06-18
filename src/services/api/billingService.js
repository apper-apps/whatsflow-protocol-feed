import mockData from '../mockData/billing.json'

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
  }
}

export default billingService