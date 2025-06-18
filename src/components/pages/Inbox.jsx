import React, { useState } from 'react';
import ConversationList from '@/components/organisms/ConversationList';

const Inbox = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
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
        
        {/* Message Area */}
        <div className="flex-1 bg-gray-50">
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;