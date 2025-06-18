import React, { useState } from 'react';
import ConversationList from '@/components/organisms/ConversationList';
import MessageThread from '@/components/organisms/MessageThread';
import LeadDetailsPanel from '@/components/organisms/LeadDetailsPanel';
import { conversationService } from '@/services';
import { toast } from 'react-toastify';

const Inbox = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showLeadPanel, setShowLeadPanel] = useState(false);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowLeadPanel(false); // Reset lead panel when switching conversations
  };

  const handleStatusChange = async (conversationId, newStatus) => {
    try {
      const updatedConversation = await conversationService.updateStatus(conversationId, newStatus);
      if (updatedConversation && selectedConversation?.Id === conversationId) {
        setSelectedConversation(updatedConversation);
      }
      return updatedConversation;
    } catch (error) {
      console.error('Failed to update conversation status:', error);
      toast.error('Failed to update conversation status');
      throw error;
    }
  };

  const handleShowLeadDetails = () => {
    setShowLeadPanel(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your conversations and messages</p>
      </div>
      
      <div className="flex-1 flex">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <ConversationList 
            selectedConversationId={selectedConversation?.Id}
            onSelectConversation={handleConversationSelect}
          />
        </div>
        
        {/* Message Thread */}
        <div className={`${showLeadPanel ? 'flex-1' : 'flex-1'} border-r border-gray-200`}>
          <MessageThread
            conversation={selectedConversation}
            onStatusChange={handleStatusChange}
            onShowLeadDetails={handleShowLeadDetails}
            showLeadPanel={showLeadPanel}
          />
        </div>

        {/* Lead Details Panel */}
        {showLeadPanel && selectedConversation && (
          <div className="w-80 bg-white">
            <LeadDetailsPanel
              conversation={selectedConversation}
              onClose={() => setShowLeadPanel(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;