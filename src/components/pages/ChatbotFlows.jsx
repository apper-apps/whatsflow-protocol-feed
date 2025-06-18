import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import { chatbotFlowService } from '@/services';
import { toast } from 'react-toastify';

const nodeTypes = {
  start: { label: 'Start', icon: 'Play', color: 'bg-green-500' },
  message: { label: 'Message', icon: 'MessageSquare', color: 'bg-blue-500' },
  question: { label: 'Question', icon: 'HelpCircle', color: 'bg-purple-500' },
  condition: { label: 'Condition', icon: 'GitBranch', color: 'bg-orange-500' },
  action: { label: 'Action', icon: 'Zap', color: 'bg-yellow-500' },
  end: { label: 'End', icon: 'Square', color: 'bg-red-500' }
};

const CustomNode = ({ data }) => {
  const nodeType = nodeTypes[data.type] || nodeTypes.message;
  
  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 border-white ${nodeType.color} text-white min-w-32`}>
      <div className="flex items-center gap-2">
        <ApperIcon name={nodeType.icon} size={16} />
        <div className="text-sm font-medium">{data.label || nodeType.label}</div>
      </div>
      {data.content && (
        <div className="text-xs mt-1 opacity-90 truncate max-w-32">
          {data.content}
        </div>
      )}
    </div>
  );
};

const nodeTypeConfig = {
  custom: CustomNode
};

const ChatbotFlows = () => {
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatbotFlowService.getAll();
      setFlows(data);
      if (data.length > 0 && !selectedFlow) {
        setSelectedFlow(data[0]);
        loadFlowData(data[0]);
      }
    } catch (err) {
      setError('Failed to load chatbot flows');
      toast.error('Failed to load chatbot flows');
    } finally {
      setLoading(false);
    }
  };

  const loadFlowData = (flow) => {
    if (flow && flow.nodes && flow.edges) {
      setNodes(flow.nodes.map(node => ({
        ...node,
        type: 'custom'
      })));
      setEdges(flow.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  };

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) {
      toast.error('Please enter a flow name');
      return;
    }

    try {
      const newFlow = await chatbotFlowService.create({
        name: newFlowName,
        description: '',
        nodes: [],
        edges: [],
        status: 'draft'
      });
      
      setFlows(prev => [...prev, newFlow]);
      setSelectedFlow(newFlow);
      loadFlowData(newFlow);
      setNewFlowName('');
      setShowCreateModal(false);
      toast.success('Flow created successfully');
    } catch (err) {
      toast.error('Failed to create flow');
    }
  };

  const handleSaveFlow = async () => {
    if (!selectedFlow) return;

    try {
      const updatedFlow = await chatbotFlowService.update(selectedFlow.Id, {
        ...selectedFlow,
        nodes: nodes.map(node => ({
          ...node,
          type: node.data.type
        })),
        edges
      });
      
      setFlows(prev => prev.map(f => f.Id === updatedFlow.Id ? updatedFlow : f));
      setSelectedFlow(updatedFlow);
      toast.success('Flow saved successfully');
    } catch (err) {
      toast.error('Failed to save flow');
    }
  };

  const handleDeleteFlow = async (flowId) => {
    if (!confirm('Are you sure you want to delete this flow?')) return;

    try {
      await chatbotFlowService.delete(flowId);
      setFlows(prev => prev.filter(f => f.Id !== flowId));
      
      if (selectedFlow?.Id === flowId) {
        const remainingFlows = flows.filter(f => f.Id !== flowId);
        if (remainingFlows.length > 0) {
          setSelectedFlow(remainingFlows[0]);
          loadFlowData(remainingFlows[0]);
        } else {
          setSelectedFlow(null);
          setNodes([]);
          setEdges([]);
        }
      }
      
      toast.success('Flow deleted successfully');
    } catch (err) {
      toast.error('Failed to delete flow');
    }
  };

  const addNode = (type) => {
    const nodeType = nodeTypes[type];
    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        type,
        label: nodeType.label,
        content: type === 'message' ? 'Enter your message...' : ''
      }
    };
    
    setNodes(nds => [...nds, newNode]);
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return (
      <div className="h-full p-6">
        <div className="flex items-center gap-4 mb-6">
          <SkeletonLoader className="h-8 w-48" />
          <SkeletonLoader className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          <SkeletonLoader className="h-full" />
          <SkeletonLoader className="h-full lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorState 
          title="Failed to load chatbot flows"
          message={error}
          onRetry={loadFlows}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransition.transition}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-surface-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-1">Chatbot Flows</h1>
            <p className="text-surface-600">Design and manage your chatbot conversation flows</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              New Flow
            </Button>
            {selectedFlow && (
              <Button
                size="sm"
                onClick={handleSaveFlow}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Save" size={16} />
                Save Flow
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-surface-200 flex flex-col">
          {/* Flow List */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium text-surface-900 mb-3">Your Flows</h3>
            {flows.length === 0 ? (
              <EmptyState
                title="No flows yet"
                message="Create your first chatbot flow to get started"
                icon="Workflow"
              />
            ) : (
              <div className="space-y-2">
                {flows.map((flow) => (
                  <div
                    key={flow.Id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFlow?.Id === flow.Id
                        ? 'border-primary bg-primary/5'
                        : 'border-surface-200 hover:border-surface-300'
                    }`}
                    onClick={() => {
                      setSelectedFlow(flow);
                      loadFlowData(flow);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-surface-900">{flow.name}</h4>
                        <p className="text-xs text-surface-500 mt-1">
                          {flow.nodes?.length || 0} nodes
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFlow(flow.Id);
                        }}
                        className="p-1 rounded hover:bg-surface-100 text-surface-400 hover:text-red-500 transition-colors"
                      >
                        <ApperIcon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Node Palette */}
          {selectedFlow && (
            <div className="p-4 border-t border-surface-200">
              <h3 className="text-sm font-medium text-surface-900 mb-3">Add Nodes</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(nodeTypes).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => addNode(type)}
                    className={`p-2 rounded-lg border border-surface-200 hover:border-surface-300 transition-all text-xs font-medium flex items-center gap-2 ${config.color} text-white hover:opacity-90`}
                  >
                    <ApperIcon name={config.icon} size={14} />
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-surface-50">
          {selectedFlow ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypeConfig}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                title="Select a flow to edit"
                message="Choose a flow from the sidebar or create a new one"
                icon="Workflow"
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Flow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Create New Flow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Flow Name
                </label>
                <Input
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="Enter flow name..."
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={handleCreateFlow}
                  className="flex-1"
                >
                  Create Flow
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewFlowName('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatbotFlows;