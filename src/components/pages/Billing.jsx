import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { formatDistanceToNow, format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import { billingService } from '@/services'

const Billing = () => {
  const [subscription, setSubscription] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      const [subData, invoiceData, paymentData] = await Promise.all([
        billingService.getSubscription(),
        billingService.getInvoices(),
        billingService.getPaymentMethods()
      ])
      setSubscription(subData)
      setInvoices(invoiceData)
      setPaymentMethods(paymentData)
      setError(null)
    } catch (err) {
      setError('Failed to load billing data')
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    try {
      await billingService.cancelSubscription()
      setSubscription(prev => ({ ...prev, status: 'cancelled' }))
      toast.success('Subscription cancelled successfully')
    } catch (err) {
      toast.error('Failed to cancel subscription')
    }
  }

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      await billingService.downloadInvoice(invoiceId)
      toast.success('Invoice download started')
    } catch (err) {
      toast.error('Failed to download invoice')
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'cancelled': return 'error'
      case 'past_due': return 'warning'
      case 'trialing': return 'info'
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-surface-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 mb-2">Error loading billing data</h3>
          <p className="text-surface-600 mb-4">{error}</p>
          <Button onClick={loadBillingData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Billing & Subscription</h1>
        <p className="text-surface-600">Manage your subscription, invoices, and payment methods</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-surface-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: 'CreditCard' },
              { id: 'invoices', label: 'Invoices', icon: 'FileText' },
              { id: 'payment', label: 'Payment Methods', icon: 'Wallet' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                }`}
              >
                <ApperIcon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Subscription */}
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Current Subscription</h2>
              <Badge variant={getStatusBadgeVariant(subscription?.status)}>
                {subscription?.status || 'Unknown'}
              </Badge>
            </div>
            
            {subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-surface-900 mb-2">{subscription.planName}</h3>
                  <p className="text-2xl font-bold text-surface-900 mb-1">
                    {formatCurrency(subscription.amount)}
                    <span className="text-sm font-normal text-surface-500">/{subscription.interval}</span>
                  </p>
                  <p className="text-surface-600">
                    Next billing: {format(new Date(subscription.nextBilling), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    Change Plan
                  </Button>
                  {subscription.status === 'active' && (
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={handleCancelSubscription}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="CreditCard" size={48} className="text-surface-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-surface-900 mb-2">No active subscription</h3>
                <p className="text-surface-600 mb-4">Choose a plan to get started</p>
                <Button>View Plans</Button>
              </div>
            )}
          </div>

          {/* Usage Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-surface-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="MessageSquare" size={16} className="text-primary" />
                </div>
                <h3 className="font-medium text-surface-900">Messages</h3>
              </div>
              <p className="text-2xl font-bold text-surface-900">2,847</p>
              <p className="text-sm text-surface-500">This month</p>
            </div>

            <div className="bg-white rounded-lg border border-surface-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Users" size={16} className="text-secondary" />
                </div>
                <h3 className="font-medium text-surface-900">Contacts</h3>
              </div>
              <p className="text-2xl font-bold text-surface-900">1,205</p>
              <p className="text-sm text-surface-500">Total active</p>
            </div>

            <div className="bg-white rounded-lg border border-surface-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Zap" size={16} className="text-success" />
                </div>
                <h3 className="font-medium text-surface-900">Automations</h3>
              </div>
              <p className="text-2xl font-bold text-surface-900">15</p>
              <p className="text-sm text-surface-500">Active flows</p>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-lg border border-surface-200">
          <div className="p-4 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-900">Invoice History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-surface-700">Invoice</th>
                  <th className="text-left py-3 px-4 font-medium text-surface-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-surface-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-surface-700">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-surface-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.Id} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-surface-900">#{invoice.number}</div>
                      <div className="text-sm text-surface-500">{invoice.description}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-surface-900">{format(new Date(invoice.date), 'MMM dd, yyyy')}</div>
                      <div className="text-sm text-surface-500">
                        {formatDistanceToNow(new Date(invoice.date), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-surface-900">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Download"
                          onClick={() => handleDownloadInvoice(invoice.Id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Eye"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-12">
              <ApperIcon name="FileText" size={48} className="text-surface-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-surface-900 mb-2">No invoices found</h3>
              <p className="text-surface-600">Your invoices will appear here once you have billing activity</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900">Payment Methods</h2>
            <Button icon="Plus">Add Payment Method</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.Id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg border border-surface-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="CreditCard" size={20} className="text-surface-600" />
                    </div>
                    <div>
                      <div className="font-medium text-surface-900">
                        •••• •••• •••• {method.last4}
                      </div>
                      <div className="text-sm text-surface-500">{method.brand.toUpperCase()}</div>
                    </div>
                  </div>
                  {method.isDefault && (
                    <Badge variant="primary" size="sm">Default</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-surface-500 mb-3">
                  <span>Expires {method.expMonth}/{method.expYear}</span>
                  <span>Added {formatDistanceToNow(new Date(method.createdAt), { addSuffix: true })}</span>
                </div>

                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Set Default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" icon="Trash2" className="text-error hover:text-error">
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {paymentMethods.length === 0 && (
            <div className="text-center py-12">
              <ApperIcon name="Wallet" size={48} className="text-surface-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-surface-900 mb-2">No payment methods</h3>
              <p className="text-surface-600 mb-4">Add a payment method to manage your subscription</p>
              <Button icon="Plus">Add Payment Method</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Billing