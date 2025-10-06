
import { GoogleGenAI, Type } from "@google/genai";
import { NetworkState, NudgeSuggestion, Persona } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const personaDescriptions: Record<Persona, string> = {
    balanced: "You are a balanced network engineer. Your strategy is to apply a moderate adjustment to the node amplitudes. This prevents instability from an overly aggressive change while still making meaningful progress towards the target.",
    aggressive: "You are an aggressive network engineer. Your priority is to reach the target amplitude as quickly as possible. You should apply a significant adjustment to the node amplitudes, even if it introduces some risk of instability.",
    conservative: "You are a conservative network engineer. Your top priority is network stability. You should apply a very small, cautious adjustment to the node amplitudes to avoid any risk of overshooting the target or causing oscillations."
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        reasoning: {
            type: Type.STRING,
            description: "A brief explanation of the strategy applied, based on the persona."
        },
        analysis: {
            type: Type.STRING,
            description: "A brief analysis of the current network state in relation to the target."
        },
        newState: {
            type: Type.OBJECT,
            description: "The new network state with adjusted amplitudes. Keys should be node names and values should be their new amplitudes as numbers between 0.0 and 1.0.",
            properties: {
                "alpha-734": { type: Type.NUMBER },
                "beta-211": { type: Type.NUMBER },
                "gamma-909": { type: Type.NUMBER },
                "delta-486": { type: Type.NUMBER },
            },
            required: ["alpha-734", "beta-211", "gamma-909", "delta-486"]
        }
    },
    required: ["reasoning", "analysis", "newState"]
};


export const getNudgeSuggestion = async (
  currentState: NetworkState,
  targetAmplitude: number,
  persona: Persona
): Promise<NudgeSuggestion> => {
  const model = "gemini-2.5-flash";
  const personaDescription = personaDescriptions[persona];

  const prompt = `
    ${personaDescription}

    Your task is to adjust the amplitudes of four quantum network nodes.
    The current network state is provided as a JSON object, where keys are node names and values are their current amplitudes (from 0.0 to 1.0).
    The target amplitude for all nodes is ${targetAmplitude.toFixed(4)}.
    
    Current state: ${JSON.stringify(currentState, null, 2)}

    Based on your persona, calculate the new amplitudes for each node. The new amplitudes must be numbers between 0.0 and 1.0.
    Provide your response as a JSON object that strictly follows the provided schema. Do not output markdown.
    `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7
        },
    });

    const jsonText = response.text.trim();
    const suggestion = JSON.parse(jsonText) as NudgeSuggestion;
    
    // Basic validation
    if (!suggestion.newState || Object.keys(suggestion.newState).length !== 4) {
        throw new Error("Invalid newState format received from AI.");
    }

    return suggestion;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to parse nudging suggestion from AI model.");
  }
};
