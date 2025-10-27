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
      <div className="bg-gradient-to-r from-white to-surface-50 border-b border-surface-200 px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Inbox</h1>
            <p className="text-sm text-surface-500 mt-1.5">Manage your conversations and messages in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={selectedConversation ? "default" : "secondary"} 
              className={`px-4 py-1.5 text-xs font-semibold shadow-sm ${
                selectedConversation 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-surface-100 text-surface-600 border border-surface-200'
              }`}
            >
              {selectedConversation ? '● Active' : 'No Selection'}
            </Badge>
          </div>
        </div>
      </div>
      
<div className="flex-1 flex overflow-hidden bg-surface-50">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-surface-200 bg-white flex-shrink-0 shadow-sm">
          <ConversationList 
            selectedConversationId={selectedConversation?.Id}
            onSelectConversation={handleConversationSelect}
          />
        </div>

        {/* Message Thread */}
        <div className={`${showLeadPanel ? 'w-0 flex-1 min-w-0' : 'flex-1'} border-r border-surface-200 bg-white`}>
          <MessageThread
            conversation={selectedConversation}
            onStatusChange={handleStatusChange}
            onShowLeadDetails={handleShowLeadDetails}
            showLeadPanel={showLeadPanel}
          />
        </div>

        {/* Lead Details Panel */}
        {showLeadPanel && selectedConversation && (
          <div className="w-80 bg-white border-l-2 border-surface-300 flex-shrink-0 overflow-hidden shadow-lg">
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