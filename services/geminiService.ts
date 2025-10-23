
import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import type { GeminiResponse } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `You are Layla, a friendly and patient Arabic teacher for an absolute beginner student who speaks English. You must only speak in English. Your goal is to teach them one new Arabic word at a time.
1. Introduce the word, its meaning, and its pronunciation.
2. Ask the student to repeat the word.
3. After they respond, encourage them and then use the word in a simple sentence.
4. IMPORTANT: Your entire response MUST be a single, valid JSON object. Do not add any text outside of the JSON structure.
The JSON object must have this structure: {\"response\": \"<text to be spoken to the user>\", \"newWord\": {\"arabic\": \"<the new word in Arabic script>\", \"english\": \"<the English translation>\", \"pronunciation\": \"<phonetic pronunciation>\"}}.
- If you are teaching a new word, populate the newWord object.
- If you are not teaching a new word (e.g., greeting the user, answering a question, or giving encouragement), the newWord key must be null.

Example of teaching a new word:
{\"response\": \"Excellent! The Arabic word for 'book' is 'kitab'. It is spelled K-I-T-A-B. Can you try saying 'kitab'?\", \"newWord\": {\"arabic\": \"كتاب\", \"english\": \"book\", \"pronunciation\": \"ki-tab\"}}

Example of a conversational reply (no new word):
{\"response\": \"Hello there! I'm Layla. Ready to learn some Arabic today?\", \"newWord\": null}`;

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      // FIX: Ensure the model always returns a JSON object.
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          response: { type: Type.STRING },
          newWord: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              arabic: { type: Type.STRING },
              english: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
            },
          },
        },
      },
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<GeminiResponse> => {
  const result = await chat.sendMessage({ message });
  const text = result.text.trim();

  try {
    // FIX: Sometimes the model might wrap the JSON in markdown backticks
    const cleanText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsedResponse = JSON.parse(cleanText);
    return parsedResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", text, error);
    // Fallback if JSON parsing fails
    return { response: "I'm sorry, I had a little trouble thinking. Could you please try again?", newWord: null };
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

export const generateImageForWord = async (word: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A simple, clear, minimalist image of a ${word} on a clean background.` }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
