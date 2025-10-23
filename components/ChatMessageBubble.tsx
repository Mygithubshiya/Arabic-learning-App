
import React from 'react';
import type { ChatMessage } from '../types';
import { UserIcon, SparklesIcon } from './Icons';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center shadow-md">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
      )}
      <div
        className={`max-w-md md:max-w-lg lg:max-w-xl rounded-2xl p-4 text-white shadow-lg
          ${isModel
            ? 'bg-gray-700 rounded-tl-none'
            : 'bg-blue-600 rounded-br-none'
          }`
        }
      >
        <p className="text-base">{message.text}</p>
      </div>
       {!isModel && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center shadow-md">
          <UserIcon className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};
