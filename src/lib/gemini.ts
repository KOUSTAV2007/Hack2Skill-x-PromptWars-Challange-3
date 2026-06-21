import { GoogleGenAI } from "@google/genai";

let _aiClient: GoogleGenAI | null = null;

/**
 * Initializes and returns a client-side Gemini AI SDK instance,
 * reading exclusively from the isolated environment config variable VITE_GEMINI_API_KEY.
 */
export function getClientGemini(): GoogleGenAI | null {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!_aiClient) {
    _aiClient = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return _aiClient;
}
