import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Chart from 'react-apexcharts'
import { conversationService, messageService, contactService } from '@/services'
import Badge from '@/components/atoms/Badge'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import ErrorState from '@/components/organisms/ErrorState'
import ApperIcon from '@/components/ApperIcon'
import { toast } from 'react-toastify'

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalMessages: 0,
    totalContacts: 0,
    responseTime: '2.5 min',
    conversationsByStatus: {},
    messagesByDay: [],
    topContacts: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [conversations, messages, contacts] = await Promise.all([
        conversationService.getAll(),
        messageService.getAll(),
        contactService.getAll()
      ])

      // Calculate analytics
      const conversationsByStatus = conversations.reduce((acc, conv) => {
        acc[conv.status] = (acc[conv.status] || 0) + 1
        return acc
      }, {})

      // Generate mock daily message data
      const messagesByDay = generateDailyData(timeRange)

      // Get top contacts by message count
      const contactMessageCounts = {}
      messages.forEach(msg => {
        const conversation = conversations.find(c => c.Id === msg.conversationId)
        if (conversation) {
          contactMessageCounts[conversation.contactId] = 
            (contactMessageCounts[conversation.contactId] || 0) + 1
        }
      })

      const topContacts = contacts
        .map(contact => ({
          ...contact,
          messageCount: contactMessageCounts[contact.Id] || 0
        }))
        .sort((a, b) => b.messageCount - a.messageCount)
        .slice(0, 5)

      setAnalytics({
        totalConversations: conversations.length,
        totalMessages: messages.length,
        totalContacts: contacts.length,
        responseTime: '2.5 min', // Mock data
        conversationsByStatus,
        messagesByDay,
        topContacts
      })
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const generateDailyData = (range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        messages: Math.floor(Math.random() * 50) + 10
      })
    }
    
    return data
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'new': return 'error'
      case 'ongoing': return 'warning'
      case 'resolved': return 'success'
      default: return 'default'
    }
  }

  const chartOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false },
      sparkline: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    colors: ['#25D366'],
    xaxis: {
      categories: analytics.messagesByDay.map(d => d.date),
      labels: {
        style: { colors: '#64748b' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b' }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'light'
    }
  }

  const chartSeries = [{
    name: 'Messages',
    data: analytics.messagesByDay.map(d => d.messages)
  }]

  const pageTransitionInitial = { opacity: 0, x: 20 }
  const pageTransitionAnimate = { opacity: 1, x: 0 }
  const pageTransitionConfig = { duration: 0.3 }

  const staggerItemInitial = { opacity: 0, y: 20 }
  const staggerItemAnimate = { opacity: 1, y: 0 }
  const getStaggerTransition = (index) => ({ delay: index * 0.1 })

  if (loading) {
    return (
      <motion.div
        initial={pageTransitionInitial}
        animate={pageTransitionAnimate}
        transition={pageTransitionConfig}
        className="h-full p-6"
      >
        <div className="mb-6">
          <div className="h-8 bg-surface-200 rounded w-32 mb-4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={staggerItemInitial}
              animate={staggerItemAnimate}
              transition={getStaggerTransition(i)}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <SkeletonLoader count={1} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={pageTransitionInitial}
        animate={pageTransitionAnimate}
        transition={pageTransitionConfig}
        className="h-full flex items-center justify-center p-6"
      >
        <ErrorState 
          message={error}
          onRetry={loadAnalytics}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={pageTransitionInitial}
      animate={pageTransitionAnimate}
      transition={pageTransitionConfig}
      className="h-full p-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">Analytics</h1>
            <p className="text-surface-600">Monitor your WhatsApp CRM performance</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={staggerItemInitial}
          animate={staggerItemAnimate}
          transition={getStaggerTransition(0)}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-600 text-sm font-medium">Total Conversations</p>
              <p className="text-2xl font-semibold text-surface-900 mt-1">
                {analytics.totalConversations}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="MessageSquare" size={24} className="text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-success">+12%</span>
            <span className="text-xs text-surface-500">from last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={staggerItemInitial}
          animate={staggerItemAnimate}
          transition={getStaggerTransition(1)}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-600 text-sm font-medium">Total Messages</p>
              <p className="text-2xl font-semibold text-surface-900 mt-1">
                {analytics.totalMessages}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Send" size={24} className="text-secondary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-success">+8%</span>
            <span className="text-xs text-surface-500">from last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={staggerItemInitial}
          animate={staggerItemAnimate}
          transition={getStaggerTransition(2)}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-600 text-sm font-medium">Total Contacts</p>
              <p className="text-2xl font-semibold text-surface-900 mt-1">
                {analytics.totalContacts}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" size={24} className="text-accent" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-success">+15%</span>
            <span className="text-xs text-surface-500">from last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={staggerItemInitial}
          animate={staggerItemAnimate}
          transition={getStaggerTransition(3)}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-600 text-sm font-medium">Avg Response Time</p>
              <p className="text-2xl font-semibold text-surface-900 mt-1">
                {analytics.responseTime}
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" size={24} className="text-success" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-success">-5%</span>
            <span className="text-xs text-surface-500">faster than last period</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Volume Chart */}
        <motion.div
          initial={staggerItemInitial}
          animate={staggerItemAnimate}
          transition={getStaggerTransition(4)}
          className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-surface-900">Message Volume</h3>
            <Badge variant="primary">Daily Messages</Badge>
          </div>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={300}
          />
        </motion.div>

        {/* Conversation Status */}
        <motion.div
          initial={staggerItemInitial}
          animate={staggerItemAnimate}
          transition={getStaggerTransition(5)}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <h3 className="text-lg font-semibold text-surface-900 mb-6">Conversation Status</h3>
          <div className="space-y-4">
            {Object.entries(analytics.conversationsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(status)} size="sm">
                    {status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-surface-600">{count}</span>
                  <div className="w-16 h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        getStatusVariant(status) === 'error' ? 'bg-error' :
                        getStatusVariant(status) === 'warning' ? 'bg-warning' :
                        'bg-success'
                      }`}
                      style={{
                        width: `${(count / analytics.totalConversations) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Contacts */}
        <motion.div
          initial={staggerItemInitial}
          animate={staggerItemAnimate}
          transition={getStaggerTransition(6)}
          className="lg:col-span-3 bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <h3 className="text-lg font-semibold text-surface-900 mb-6">Most Active Contacts</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 font-medium text-surface-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-surface-700">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-surface-700">Messages</th>
                  <th className="text-left py-3 px-4 font-medium text-surface-700">Tags</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topContacts.map((contact, index) => (
                  <tr key={contact.Id} className="border-b border-surface-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {contact.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium text-surface-900">{contact.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-surface-600">{contact.phone}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" size="sm">{contact.messageCount}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.slice(0, 2).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="default" size="sm">
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags?.length > 2 && (
                          <Badge variant="default" size="sm">
                            +{contact.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Analytics