
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface LearnedWord {
  arabic: string;
  english: string;
  pronunciation: string;
  imageUrl: string;
}

export interface NewWord {
  arabic: string;
  english: string;
  pronunciation: string;
}

export interface GeminiResponse {
  response: string;
  newWord: NewWord | null;
}

// FIX: Add comprehensive type definitions for the Web Speech API to ensure type safety.
export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}


export interface SpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

// FIX: Augment the global Window interface to include non-standard, browser-prefixed APIs.
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
    webkitAudioContext: typeof AudioContext;
  }
}
