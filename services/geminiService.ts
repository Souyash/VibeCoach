import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { VibeCoachResponse } from "../types";

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:video/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeVibe = async (
  mediaBlob: Blob, 
  context: string,
  mediaType: string // e.g., 'video/webm' or 'audio/webm'
): Promise<VibeCoachResponse> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await blobToBase64(mediaBlob);

  const prompt = `Context: ${context}. Analyze this recording.`;

  // Define the schema for structured JSON output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      analysis: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: "Score from 0 to 100" },
          primary_issue: { type: Type.STRING, description: "The main weakness identified" },
        },
        required: ["score", "primary_issue"],
      },
      improvement_plan: {
        type: Type.OBJECT,
        properties: {
          correction_example: {
            type: Type.OBJECT,
            properties: {
              what_you_said: { type: Type.STRING },
              what_you_should_say: { type: Type.STRING },
            },
            required: ["what_you_said", "what_you_should_say"],
          },
          body_language_fix: {
            type: Type.OBJECT,
            properties: {
              issue: { type: Type.STRING },
              instruction: { type: Type.STRING },
            },
            required: ["issue", "instruction"],
          },
          immediate_drill: {
            type: Type.OBJECT,
            properties: {
              drill_name: { type: Type.STRING },
              instructions: { type: Type.STRING },
              drill_content: { type: Type.STRING },
            },
            required: ["drill_name", "instructions", "drill_content"],
          },
        },
        required: ["correction_example", "body_language_fix", "immediate_drill"],
      },
      next_step: { type: Type.STRING },
    },
    required: ["analysis", "improvement_plan", "next_step"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mediaType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as VibeCoachResponse;
    } else {
      throw new Error("No response text received from Gemini");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};