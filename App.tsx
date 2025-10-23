
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';
import { LearnedWordsPanel } from './components/LearnedWordsPanel';
import { createChatSession, sendMessageToGemini, generateSpeech, generateImageForWord } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';
// FIX: Import SpeechRecognition type to use it for type annotations.
import type { ChatMessage, LearnedWord, GeminiResponse, SpeechRecognition } from './types';

// SpeechRecognition API might be prefixed
// FIX: Rename variable to avoid conflict with the 'SpeechRecognition' type.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition: SpeechRecognition | null = null;
if (SpeechRecognitionAPI) {
    // FIX: Use renamed variable to instantiate.
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
}

const App: React.FC = () => {
    const [appState, setAppState] = useState<'welcome' | 'chatting'>('welcome');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const chatSession = useRef<Chat | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const audioQueue = useRef<AudioBuffer[]>([]);
    const isPlayingAudio = useRef<boolean>(false);

    useEffect(() => {
        // FIX: Check for API support using the renamed variable.
        if (!SpeechRecognitionAPI) {
            alert("Your browser does not support the SpeechRecognition API. Please use Chrome or another supported browser.");
        }
    }, []);

    const playNextInQueue = () => {
        if (isPlayingAudio.current || audioQueue.current.length === 0) {
            return;
        }
        isPlayingAudio.current = true;
        const audioBuffer = audioQueue.current.shift();
        
        if (audioBuffer && audioContext.current) {
            const source = audioContext.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.current.destination);
            source.onended = () => {
                isPlayingAudio.current = false;
                playNextInQueue();
            };
            source.start();
        } else {
            isPlayingAudio.current = false;
        }
    };

    const speakText = async (text: string) => {
        setStatusMessage('Generating speech...');
        const base64Audio = await generateSpeech(text);
        if (base64Audio && audioContext.current) {
            const decodedAudio = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedAudio, audioContext.current, 24000, 1);
            audioQueue.current.push(audioBuffer);
            playNextInQueue();
        }
        setStatusMessage('');
    };
    
    const handleStart = () => {
        if (!audioContext.current) {
            try {
              // FIX: The error for webkitAudioContext is resolved by the global type declaration in types.ts
              audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
              console.error("Web Audio API is not supported in this browser");
              alert("Your browser does not support the Web Audio API, which is needed for this app to function.");
              return;
            }
        }
        chatSession.current = createChatSession();
        setAppState('chatting');
        const initialMessage = "Hello";
        processUserMessage(initialMessage, true);
    };

    const processUserMessage = async (text: string, isInitial = false) => {
        setIsThinking(true);
        setStatusMessage('Thinking...');
        if (!isInitial) {
            setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'user', text }]);
        }

        if (!chatSession.current) return;

        try {
            const geminiResponse: GeminiResponse = await sendMessageToGemini(chatSession.current, text);
            setChatHistory(prev => [...prev, { id: Date.now().toString() + '-model', role: 'model', text: geminiResponse.response }]);
            
            await speakText(geminiResponse.response);

            if (geminiResponse.newWord) {
                setStatusMessage('Generating image...');
                const imageUrl = await generateImageForWord(geminiResponse.newWord.english);
                if (imageUrl) {
                    setLearnedWords(prev => [...prev, { ...geminiResponse.newWord, imageUrl }]);
                }
            }

        } catch (error) {
            console.error("Error processing message:", error);
            const errorMessage = "I'm sorry, I encountered an error. Please try again.";
            setChatHistory(prev => [...prev, { id: Date.now().toString() + '-error', role: 'model', text: errorMessage }]);
            await speakText(errorMessage);
        } finally {
            setIsThinking(false);
            setStatusMessage('');
        }
    };

    const handleMicClick = () => {
        if (!recognition) return;

        if (isRecording) {
            recognition.stop();
            setIsRecording(false);
        } else {
            setIsRecording(true);
            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                processUserMessage(transcript);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsRecording(false);
            };
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col md:flex-row bg-gray-900 text-gray-100 font-sans">
            {appState === 'welcome' && <WelcomeScreen onStart={handleStart} />}
            {appState === 'chatting' && (
                <>
                    <div className="flex-grow flex flex-col h-full md:w-2/3 p-4">
                        <ChatInterface 
                            chatHistory={chatHistory}
                            isRecording={isRecording}
                            isThinking={isThinking}
                            statusMessage={statusMessage}
                            onMicClick={handleMicClick}
                        />
                    </div>
                    <div className="w-full md:w-1/3 h-1/2 md:h-full bg-gray-950 p-4 border-l border-gray-700 overflow-y-auto">
                        <LearnedWordsPanel words={learnedWords} />
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
