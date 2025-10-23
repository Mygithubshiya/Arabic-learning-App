
import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MicrophoneIcon, SpeakerWaveIcon } from './Icons';
import { ChatMessageBubble } from './ChatMessageBubble';
import { RecordingIndicator } from './RecordingIndicator';
import { ThinkingIndicator } from './ThinkingIndicator';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  isRecording: boolean;
  isThinking: boolean;
  statusMessage: string;
  onMicClick: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, isRecording, isThinking, statusMessage, onMicClick }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
            <header className="p-4 border-b border-gray-700 text-center">
                <h1 className="text-2xl font-bold text-teal-400">Your Lesson with Layla</h1>
            </header>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {chatHistory.map((msg) => (
                    <ChatMessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={chatEndRef} />
            </div>

            <footer className="p-4 flex flex-col items-center justify-center">
                <div className="h-10 mb-4 text-center">
                    {isThinking && <ThinkingIndicator message={statusMessage} />}
                </div>
                <button
                    onClick={onMicClick}
                    disabled={isThinking}
                    className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-500/50
                        ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-500 hover:bg-teal-600'}
                        ${isThinking ? 'bg-gray-600 cursor-not-allowed' : ''}
                        shadow-lg`}
                >
                    {isRecording && <RecordingIndicator />}
                    <MicrophoneIcon className="w-10 h-10 text-white" />
                </button>
                <p className="mt-4 text-sm text-gray-400">
                    {isThinking ? "Please wait..." : (isRecording ? "Listening..." : "Tap to speak")}
                </p>
            </footer>
        </div>
    );
};
