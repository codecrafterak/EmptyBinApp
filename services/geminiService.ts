import { GoogleGenAI } from "@google/genai";
import { Bin } from "../types";

export const analyzeBinData = async (bin: Bin): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "API Key not found. Please check your environment configuration.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a prompt based on bin data
    const recentReadings = bin.history.slice(-10).map(r => 
      `Time: ${new Date(r.timestamp).toLocaleTimeString()}, Fill: ${r.fillPercentage}%`
    ).join('\n');

    const prompt = `
      Analyze the waste fill pattern for this bin:
      Name: ${bin.name}
      Location: ${bin.location}
      Total Capacity (Height): ${bin.heightCm}cm
      
      Recent Data (Last 10 hours):
      ${recentReadings}

      Provide a concise 3-bullet point summary advising on:
      1. Peak usage times.
      2. Potential pickup schedule optimization.
      3. Any anomalies (like sudden spikes or if it seems to be overflowing).
      Keep the tone professional and helpful for a facility manager.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze data. Please try again later.";
  }
};
