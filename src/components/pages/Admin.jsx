import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import { clientService, featureAccessService } from '@/services'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('clients')
  
  // Clients state
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientsError, setClientsError] = useState(null)
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [clientFormData, setClientFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active'
  })

  // Feature Access state
  const [features, setFeatures] = useState([])
  const [featuresLoading, setFeaturesLoading] = useState(true)
  const [featuresError, setFeaturesError] = useState(null)
  const [featureSearchTerm, setFeatureSearchTerm] = useState('')
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [editingFeature, setEditingFeature] = useState(null)
  const [featureFormData, setFeatureFormData] = useState({
    name: '',
    description: '',
    isEnabled: true,
    userIds: []
  })

  // Load data
  useEffect(() => {
    loadClients()
    loadFeatures()
  }, [])

  const loadClients = async () => {
    try {
      setClientsLoading(true)
      setClientsError(null)
      const data = await clientService.getAll()
      setClients(data)
    } catch (error) {
      setClientsError('Failed to load clients')
      toast.error('Failed to load clients')
    } finally {
      setClientsLoading(false)
    }
  }

  const loadFeatures = async () => {
    try {
      setFeaturesLoading(true)
      setFeaturesError(null)
      const data = await featureAccessService.getAll()
      setFeatures(data)
    } catch (error) {
      setFeaturesError('Failed to load features')
      toast.error('Failed to load features')
    } finally {
      setFeaturesLoading(false)
    }
  }

  // Client handlers
  const handleAddClient = () => {
    setEditingClient(null)
    setClientFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'active'
    })
    setShowClientModal(true)
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setClientFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      status: client.status
    })
    setShowClientModal(true)
  }

  const handleDeleteClient = async (client) => {
    if (window.confirm(`Are you sure you want to delete client "${client.name}"?`)) {
      try {
        await clientService.delete(client.Id)
        setClients(prev => prev.filter(c => c.Id !== client.Id))
        toast.success('Client deleted successfully')
      } catch (error) {
        toast.error('Failed to delete client')
      }
    }
  }

  const handleClientSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingClient) {
        const updatedClient = await clientService.update(editingClient.Id, clientFormData)
        setClients(prev => prev.map(c => c.Id === editingClient.Id ? updatedClient : c))
        toast.success('Client updated successfully')
      } else {
        const newClient = await clientService.create(clientFormData)
        setClients(prev => [...prev, newClient])
        toast.success('Client created successfully')
      }
      setShowClientModal(false)
    } catch (error) {
      toast.error('Failed to save client')
    }
  }

  // Feature handlers
  const handleAddFeature = () => {
    setEditingFeature(null)
    setFeatureFormData({
      name: '',
      description: '',
      isEnabled: true,
      userIds: []
    })
    setShowFeatureModal(true)
  }

  const handleEditFeature = (feature) => {
    setEditingFeature(feature)
    setFeatureFormData({
      name: feature.name,
      description: feature.description,
      isEnabled: feature.isEnabled,
      userIds: feature.userIds || []
    })
    setShowFeatureModal(true)
  }

  const handleDeleteFeature = async (feature) => {
    if (window.confirm(`Are you sure you want to delete feature "${feature.name}"?`)) {
      try {
        await featureAccessService.delete(feature.Id)
        setFeatures(prev => prev.filter(f => f.Id !== feature.Id))
        toast.success('Feature deleted successfully')
      } catch (error) {
        toast.error('Failed to delete feature')
      }
    }
  }

  const handleFeatureSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFeature) {
        const updatedFeature = await featureAccessService.update(editingFeature.Id, featureFormData)
        setFeatures(prev => prev.map(f => f.Id === editingFeature.Id ? updatedFeature : f))
        toast.success('Feature updated successfully')
      } else {
        const newFeature = await featureAccessService.create(featureFormData)
        setFeatures(prev => [...prev, newFeature])
        toast.success('Feature created successfully')
      }
      setShowFeatureModal(false)
    } catch (error) {
      toast.error('Failed to save feature')
    }
  }

  // Filter data
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(clientSearchTerm.toLowerCase())
  )

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(featureSearchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(featureSearchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Admin Dashboard</h1>
        <p className="text-surface-600">Manage clients and feature access permissions</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-surface-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('clients')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'clients'
                ? 'border-primary text-primary'
                : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="Users" size={16} />
              Clients
            </div>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'features'
                ? 'border-primary text-primary'
                : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="Settings" size={16} />
              Feature Access
            </div>
          </button>
        </nav>
      </div>

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search clients..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
            <Button onClick={handleAddClient} className="flex items-center gap-2">
              <ApperIcon name="Plus" size={16} />
              Add Client
            </Button>
          </div>

          {clientsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : clientsError ? (
            <div className="text-center py-12">
              <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-surface-600">{clientsError}</p>
              <Button onClick={loadClients} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-200">
                  <thead className="bg-surface-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-surface-200">
                    {filteredClients.map((client) => (
                      <tr key={client.Id} className="hover:bg-surface-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-surface-900">{client.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-surface-900">{client.email}</div>
                          <div className="text-sm text-surface-500">{client.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900">
                          {client.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={client.status === 'active' ? 'success' : 'secondary'}
                            size="sm"
                          >
                            {client.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClient(client)}
                              className="text-primary hover:text-primary/80 p-1 rounded"
                            >
                              <ApperIcon name="Edit" size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client)}
                              className="text-red-600 hover:text-red-500 p-1 rounded"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <ApperIcon name="Users" size={48} className="mx-auto text-surface-400 mb-4" />
                  <p className="text-surface-600">No clients found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search features..."
                value={featureSearchTerm}
                onChange={(e) => setFeatureSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
            <Button onClick={handleAddFeature} className="flex items-center gap-2">
              <ApperIcon name="Plus" size={16} />
              Add Feature
            </Button>
          </div>

          {featuresLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : featuresError ? (
            <div className="text-center py-12">
              <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-surface-600">{featuresError}</p>
              <Button onClick={loadFeatures} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeatures.map((feature) => (
                <div key={feature.Id} className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-surface-900 mb-1">{feature.name}</h3>
                      <p className="text-sm text-surface-600">{feature.description}</p>
                    </div>
                    <Badge
                      variant={feature.isEnabled ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {feature.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-surface-500 mb-2">
                      Users: {feature.userIds?.length || 0}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditFeature(feature)}
                      className="text-primary hover:text-primary/80 p-2 rounded"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(feature)}
                      className="text-red-600 hover:text-red-500 p-2 rounded"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredFeatures.length === 0 && !featuresLoading && (
            <div className="text-center py-12">
              <ApperIcon name="Settings" size={48} className="mx-auto text-surface-400 mb-4" />
              <p className="text-surface-600">No features found</p>
            </div>
          )}
        </div>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingClient ? 'Edit Client' : 'Add Client'}
              </h2>
              <button
                onClick={() => setShowClientModal(false)}
                className="p-2 hover:bg-surface-100 rounded-lg"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4">
              <Input
                label="Name"
                value={clientFormData.name}
                onChange={(e) => setClientFormData({...clientFormData, name: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                required
              />
              <Input
                label="Phone"
                value={clientFormData.phone}
                onChange={(e) => setClientFormData({...clientFormData, phone: e.target.value})}
                required
              />
              <Input
                label="Company"
                value={clientFormData.company}
                onChange={(e) => setClientFormData({...clientFormData, company: e.target.value})}
                required
              />
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Status
                </label>
                <select
                  value={clientFormData.status}
                  onChange={(e) => setClientFormData({...clientFormData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowClientModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingClient ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingFeature ? 'Edit Feature' : 'Add Feature'}
              </h2>
              <button
                onClick={() => setShowFeatureModal(false)}
                className="p-2 hover:bg-surface-100 rounded-lg"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleFeatureSubmit} className="space-y-4">
              <Input
                label="Feature Name"
                value={featureFormData.name}
                onChange={(e) => setFeatureFormData({...featureFormData, name: e.target.value})}
                required
              />
              <Input
                label="Description"
                value={featureFormData.description}
                onChange={(e) => setFeatureFormData({...featureFormData, description: e.target.value})}
                required
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={featureFormData.isEnabled}
                  onChange={(e) => setFeatureFormData({...featureFormData, isEnabled: e.target.checked})}
                  className="h-4 w-4 text-primary focus:ring-primary border-surface-300 rounded"
                />
                <label htmlFor="isEnabled" className="text-sm font-medium text-surface-700">
                  Feature Enabled
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFeatureModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingFeature ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin