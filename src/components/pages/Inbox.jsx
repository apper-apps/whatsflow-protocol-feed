import React from 'react';

const Inbox = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your conversations and messages</p>
      </div>
      
      <div className="flex-1 flex">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4">
            <div className="text-center text-gray-500 mt-8">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Your inbox conversations will appear here</p>
            </div>
          </div>
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