import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import { toast } from 'react-toastify'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account')
  const [settings, setSettings] = useState({
    // Account settings
    businessName: 'My Business',
    businessPhone: '+1234567890',
    businessEmail: 'contact@mybusiness.com',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    messageAlerts: true,
    
    // Team settings
    autoAssignment: true,
    workingHours: '09:00-17:00',
    timezone: 'UTC',
    
    // Integration settings
    webhookUrl: '',
    apiKey: 'sk_test_...',
    
    // Appearance settings
    theme: 'light',
    language: 'en'
  })

  const tabs = [
    { id: 'account', label: 'Account', icon: 'User' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'team', label: 'Team', icon: 'Users' },
    { id: 'integrations', label: 'Integrations', icon: 'Zap' },
    { id: 'appearance', label: 'Appearance', icon: 'Palette' }
  ]

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  const pageTransitionInitial = { opacity: 0, x: 20 }
  const pageTransitionAnimate = { opacity: 1, x: 0 }
  const pageTransitionConfig = { duration: 0.3 }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Business Name"
                  value={settings.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                />
                <Input
                  label="Business Phone"
                  value={settings.businessPhone}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                />
                <Input
                  label="Business Email"
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Security</h3>
              <div className="space-y-4">
                <Button variant="outline" icon="Key">
                  Change Password
                </Button>
                <Button variant="outline" icon="Shield">
                  Two-Factor Authentication
                </Button>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-surface-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-surface-900">Email Notifications</h4>
                    <p className="text-sm text-surface-600">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => handleToggle('emailNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-primary' : 'bg-surface-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-surface-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-surface-900">Push Notifications</h4>
                    <p className="text-sm text-surface-600">Receive push notifications in browser</p>
                  </div>
                  <button
                    onClick={() => handleToggle('pushNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.pushNotifications ? 'bg-primary' : 'bg-surface-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-surface-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-surface-900">Message Alerts</h4>
                    <p className="text-sm text-surface-600">Get alerts for new messages</p>
                  </div>
                  <button
                    onClick={() => handleToggle('messageAlerts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.messageAlerts ? 'bg-primary' : 'bg-surface-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.messageAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'team':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Team Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-surface-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-surface-900">Auto Assignment</h4>
                    <p className="text-sm text-surface-600">Automatically assign new conversations</p>
                  </div>
                  <button
                    onClick={() => handleToggle('autoAssignment')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoAssignment ? 'bg-primary' : 'bg-surface-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoAssignment ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Working Hours
                    </label>
                    <select 
                      value={settings.workingHours}
                      onChange={(e) => handleInputChange('workingHours', e.target.value)}
                      className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="24/7">24/7</option>
                      <option value="09:00-17:00">9 AM - 5 PM</option>
                      <option value="08:00-18:00">8 AM - 6 PM</option>
                      <option value="10:00-16:00">10 AM - 4 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Timezone
                    </label>
                    <select 
                      value={settings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CST">Central Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Team Members</h3>
              <div className="space-y-3">
                {['Agent 1', 'Agent 2', 'Agent 3'].map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-surface-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {agent.charAt(agent.length - 1)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-surface-900">{agent}</h4>
                        <p className="text-sm text-surface-600">Online</p>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" icon="Plus" className="mt-4">
                Add Team Member
              </Button>
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">API Configuration</h3>
              <div className="space-y-4">
                <Input
                  label="API Key"
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  rightIcon="Copy"
                />
                <Input
                  label="Webhook URL"
                  value={settings.webhookUrl}
                  onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Available Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Zapier', description: 'Connect with 3000+ apps', status: 'Available' },
                  { name: 'Shopify', description: 'E-commerce integration', status: 'Connected' },
                  { name: 'Salesforce', description: 'CRM integration', status: 'Available' },
                  { name: 'Slack', description: 'Team notifications', status: 'Available' }
                ].map((integration, index) => (
                  <div key={index} className="p-4 border border-surface-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-surface-900">{integration.name}</h4>
                      <Badge variant={integration.status === 'Connected' ? 'success' : 'default'}>
                        {integration.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-surface-600 mb-3">{integration.description}</p>
                    <Button 
                      variant={integration.status === 'Connected' ? 'outline' : 'primary'} 
                      size="sm"
                    >
                      {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleInputChange('theme', 'light')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.theme === 'light' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <div className="w-full h-20 bg-white border border-surface-200 rounded mb-3"></div>
                  <span className="font-medium">Light</span>
                </button>
                <button
                  onClick={() => handleInputChange('theme', 'dark')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.theme === 'dark' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <div className="w-full h-20 bg-surface-800 border border-surface-600 rounded mb-3"></div>
                  <span className="font-medium">Dark</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-surface-900 mb-4">Language</h3>
              <select 
                value={settings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full max-w-xs p-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
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
        <h1 className="text-2xl font-semibold text-surface-900 mb-2">Settings</h1>
        <p className="text-surface-600">Manage your WhatsFlow CRM configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`}
              >
                <ApperIcon name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-surface-200">
              <Button variant="outline">
                Reset
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings