import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { format, formatDistanceToNow } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { billingService } from "@/services";

// Helper function to safely format dates
const safeFormatDate = (dateString, formatString = 'MMM dd, yyyy') => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return format(date, formatString)
  } catch (error) {
    console.warn('Date formatting error:', error)
    return 'Invalid date'
  }
}

// Helper function to safely format relative time
const safeFormatDistanceToNow = (dateString, options = { addSuffix: true }) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return formatDistanceToNow(date, options)
  } catch (error) {
    console.warn('Relative time formatting error:', error)
    return 'Invalid date'
  }
}

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
              { id: 'payment', label: 'Payment Methods', icon: 'Wallet' },
              { id: 'plans', label: 'Plans', icon: 'Package' }
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
                  </p>
                  <p className="text-sm text-surface-500">per month</p>
                </div>
                <div>
                  <div className="text-sm text-surface-500 mb-1">Next billing date</div>
                  <div className="text-lg font-semibold text-surface-900">
                    {subscription.status === 'cancelled' ? 'Cancelled' : (
                      safeFormatDate(subscription.nextBilling)
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
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
                      <div className="text-surface-900">{safeFormatDate(invoice.date)}</div>
                      <div className="text-sm text-surface-500">
                        {safeFormatDistanceToNow(invoice.date)}
                      </div>
</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-surface-900">{formatCurrency(invoice.amount)}</div>
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
                  <span>Added {safeFormatDistanceToNow(method.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-2">
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

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-surface-900">WhatsApp Platform Subscription Plans</h3>
              <p className="text-sm text-surface-600">Choose the perfect plan for your business needs</p>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Plan */}
            <div className="bg-white border border-surface-200 rounded-lg p-6 hover:shadow-md transition-shadow">
<div className="text-center mb-6">
                <h4 className="text-xl font-semibold text-surface-900 mb-2">Monthly Plan</h4>
                <p className="text-sm text-surface-600">Perfect for getting started</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Platform Rental</span>
                  <span className="text-sm font-semibold text-surface-900">₹800/month</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Marketing</span>
                  <span className="text-sm font-semibold text-surface-900">₹0.88</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Authentication</span>
                  <span className="text-sm font-semibold text-surface-900">₹0.13</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Utility</span>
                  <span className="text-sm font-semibold text-surface-900">₹0.13</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-surface-700">Service</span>
                  <Badge variant="success" className="text-xs">FREE</Badge>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full">
                  <ApperIcon name="CreditCard" size={16} className="mr-2" />
                  Choose Monthly
                </Button>
              </div>
            </div>

            {/* Half Yearly Plan */}
            <div className="bg-white border-2 border-primary rounded-lg p-6 hover:shadow-md transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="primary" className="text-xs px-3 py-1">POPULAR</Badge>
              </div>
              
              <div className="text-center mb-6">
                <h4 className="text-xl font-semibold text-surface-900 mb-2">Half Yearly Plan</h4>
                <p className="text-sm text-surface-600">Best value for growing businesses</p>
                <div className="mt-2">
                  <Badge variant="success" className="text-xs">Save 15%</Badge>
                </div>
              </div>
              
<div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Platform Rental</span>
                  <span className="text-sm font-semibold text-surface-900">₹600/month</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Marketing</span>
<div className="text-right">
                    <span className="text-sm font-semibold text-surface-900">₹0.88</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Authentication</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-surface-900">₹0.13</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Utility</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-surface-900">₹0.13</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-surface-700">Service</span>
                  <Badge variant="success" className="text-xs">FREE</Badge>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full" variant="primary">
                  <ApperIcon name="CreditCard" size={16} className="mr-2" />
                  Choose Half Yearly
                </Button>
              </div>
            </div>

            {/* Yearly Plan */}
            <div className="bg-white border border-surface-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="text-center mb-6">
                <h4 className="text-xl font-semibold text-surface-900 mb-2">Yearly Plan</h4>
                <p className="text-sm text-surface-600">Maximum savings for enterprises</p>
                <div className="mt-2">
                  <Badge variant="warning" className="text-xs">Save 25%</Badge>
                </div>
              </div>
              
<div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Platform Rental</span>
                  <span className="text-sm font-semibold text-surface-900">₹400/month</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
<span className="text-sm font-medium text-surface-700">Marketing</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-surface-900">₹0.88</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Authentication</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-surface-900">₹0.13</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-100">
                  <span className="text-sm font-medium text-surface-700">Utility</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-surface-900">₹0.13</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-surface-700">Service</span>
                  <Badge variant="success" className="text-xs">FREE</Badge>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full" variant="outline">
                  <ApperIcon name="CreditCard" size={16} className="mr-2" />
                  Choose Yearly
                </Button>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div className="bg-surface-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-surface-900 mb-4">What's Included</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <ApperIcon name="Check" size={16} className="text-primary" />
                <span className="text-sm text-surface-700">Unlimited WhatsApp API access</span>
              </div>
              <div className="flex items-center gap-3">
                <ApperIcon name="Check" size={16} className="text-primary" />
                <span className="text-sm text-surface-700">24/7 customer support</span>
              </div>
              <div className="flex items-center gap-3">
                <ApperIcon name="Check" size={16} className="text-primary" />
                <span className="text-sm text-surface-700">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <ApperIcon name="Check" size={16} className="text-primary" />
                <span className="text-sm text-surface-700">Multi-user collaboration</span>
              </div>
              <div className="flex items-center gap-3">
                <ApperIcon name="Check" size={16} className="text-primary" />
                <span className="text-sm text-surface-700">Template management</span>
              </div>
              <div className="flex items-center gap-3">
                <ApperIcon name="Check" size={16} className="text-primary" />
                <span className="text-sm text-surface-700">Contact organization</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing