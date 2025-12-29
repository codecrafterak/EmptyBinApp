import { GoogleGenAI } from "@google/genai";
import { Bin } from "../types";
import { getMockWeeklyStats } from "./mockService";

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

    // Inject mock weekly stats to allow the AI to generate "trends" even with limited real history in the demo
    const weeklyStats = getMockWeeklyStats(bin);

    const prompt = `
      You are an expert waste management analyst. Analyze the following data for a smart bin.

      BIN DETAILS:
      - Name: ${bin.name}
      - Location: ${bin.location}
      - Capacity: ${bin.heightCm}cm

      AGGREGATED WEEKLY STATS (Calculated):
      - Average Fill Rate: ${weeklyStats.averageFillRate}
      - Observed Peak Usage Day: ${weeklyStats.peakDay}
      - Peak Usage Hour: ${weeklyStats.peakHour}

      RECENT RAW SENSOR DATA (Last 10 readings):
      ${recentReadings}

      TASK:
      Provide a concise 3-bullet point "Data & Insights" summary.
      1. Identify usage patterns (e.g., "Bin fills faster on [Peak Day] due to...").
      2. Suggest an optimization for the pickup schedule based on the fill rate.
      3. Flag any recent anomalies or confirm normal operation based on the raw data.

      Tone: Professional, data-driven, and actionable. Do not use markdown headers like '##'. Just the bullet points.
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
