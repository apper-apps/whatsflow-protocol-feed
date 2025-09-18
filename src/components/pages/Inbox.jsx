import React, { useState } from "react";
import { conversationService } from "@/services";
import { toast } from "react-toastify";
import Badge from "@/components/atoms/Badge";
import MessageThread from "@/components/organisms/MessageThread";
import LeadDetailsPanel from "@/components/organisms/LeadDetailsPanel";
import ConversationList from "@/components/organisms/ConversationList";

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
      <div className="bg-white border-b border-surface-200 px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">Inbox</h1>
            <p className="text-sm text-surface-600 mt-1">Manage your conversations and messages</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              {selectedConversation ? 'Active' : 'Select Conversation'}
            </Badge>
          </div>
        </div>
      </div>
      
<div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-surface-200 bg-white flex-shrink-0">
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
          <div className="w-80 bg-surface-50 border-l border-surface-200 flex-shrink-0 overflow-hidden">
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