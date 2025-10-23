
import React from 'react';

interface ThinkingIndicatorProps {
    message: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ message }) => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
        <span className="text-gray-400 ml-3">{message}</span>
    </div>
);
