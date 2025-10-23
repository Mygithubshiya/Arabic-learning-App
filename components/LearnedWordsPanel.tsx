
import React from 'react';
import type { LearnedWord } from '../types';

interface LearnedWordsPanelProps {
  words: LearnedWord[];
}

export const LearnedWordsPanel: React.FC<LearnedWordsPanelProps> = ({ words }) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-teal-400 mb-6 text-center">My Learned Words</h2>
      {words.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500">Your new words will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {words.map((word, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center shadow-md transition-transform transform hover:scale-105 hover:bg-gray-700/50">
              <img 
                src={word.imageUrl} 
                alt={word.english} 
                className="w-20 h-20 rounded-md object-cover mr-4 border-2 border-gray-600"
              />
              <div className="flex-grow">
                <p className="text-2xl font-bold text-white" style={{ direction: 'rtl' }}>{word.arabic}</p>
                <p className="text-lg text-teal-300">{word.pronunciation}</p>
                <p className="text-md text-gray-400 capitalize">{word.english}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
