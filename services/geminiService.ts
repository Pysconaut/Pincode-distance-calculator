import { GoogleGenAI, Type } from "@google/genai";
import type { DrivingInfo } from '../types';

const getDrivingInfo = async (origin: string, destination: string): Promise<DrivingInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Calculate the driving distance in kilometers, estimated travel time, and the main route summary between ${origin}, India and ${destination}, India.`,
      config: {
        systemInstruction: "You are a route calculation expert. Provide the driving distance, estimated time, and a brief route summary. Respond ONLY with a clean JSON object containing 'distance' (number in km), 'travelTime' (string, e.g., '2 hours 59 mins'), and 'routeSummary' (string, e.g., 'via NH48'). Do not add explanations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distance: {
              type: Type.NUMBER,
              description: "Driving distance in kilometers."
            },
            travelTime: {
              type: Type.STRING,
              description: "Estimated travel time by car."
            },
            routeSummary: {
              type: Type.STRING,
              description: "A brief summary of the main route taken, starting with 'via'."
            }
          },
          required: ["distance", "travelTime", "routeSummary"],
        },
      },
    });
    
    const jsonString = response.text.trim();
    if (!jsonString) {
      throw new Error(`Could not find a route. The API returned an empty response.`);
    }

    const data: DrivingInfo = JSON.parse(jsonString);

    if (!data?.distance || !data?.travelTime || !data?.routeSummary) {
        throw new Error(`Could not determine a valid route. The location may be invalid or too ambiguous.`);
    }

    return data;

  } catch (error) {
    console.error(`Error fetching driving info for "${origin}" to "${destination}":`, error);
    // Rethrow original error for UI to handle specific cases like invalid API keys.
    throw error;
  }
};


export { getDrivingInfo };