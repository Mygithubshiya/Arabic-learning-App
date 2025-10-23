
import React from 'react';
import { BookOpenIcon, SparklesIcon } from './Icons';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-900 to-slate-800 p-8 text-center">
      <div className="max-w-2xl">
        <div className="mb-8 flex justify-center">
          <SparklesIcon className="w-16 h-16 text-teal-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
          Welcome to Arabic Teacher AI
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Learn Arabic with your personal AI tutor, Layla. Speak, listen, and see new words come to life.
        </p>
        <button
          onClick={onStart}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 flex items-center justify-center mx-auto"
        >
          <BookOpenIcon className="w-6 h-6 mr-3" />
          Start Learning
        </button>
      </div>
    </div>
  );
};
