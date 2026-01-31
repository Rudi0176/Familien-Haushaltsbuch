
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getOnboardingResponse = async (messages: any[]) => {
  const ai = getAI();
  const systemInstruction = `Onboarding Finanz-Mentor für Familien. Sammle Name, Pers., Miete/Eigenheim, Auto, Tiere, Sparziel, Schulden. Stelle immer nur EINE FRAGE. Gib am Ende JSON zurück.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: messages,
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text;
  } catch (e) { return "Hoppla!"; }
};

export const getFinancialAdvice = async (messages: any[], summary: string, context: string) => {
  const ai = getAI();
  const systemInstruction = `Finanz-Mentor für Familien. Profil: ${context}. Daten: ${summary}. Sei herzlich und gib konkrete Spartipps.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      config: { systemInstruction, temperature: 0.8 }
    });
    return response.text;
  } catch (e) { return "Technischer Fehler."; }
};

export const analyzeReceipt = async (imageBase64: string, categories: string[]) => {
  const ai = getAI();
  const prompt = `Analysiere diesen Beleg und gib JSON zurück: amount, description, category, type (Ausgabe/Einnahme).`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) { return null; }
};
