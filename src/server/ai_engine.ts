import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export async function getOptimizationExplanation(instanceId: string, instanceType: string, cpu: number, action: string) {
  if (!API_KEY) return "AI explanation unavailable (API Key missing).";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze the following cloud infrastructure instance and explain the recommendation in a professional, concise way.
    
    Instance ID: ${instanceId}
    Instance Type: ${instanceType}
    Average CPU Usage: ${cpu}%
    Recommendation: ${action}
    
    Explain why this recommendation was made and what the potential benefit is. Keep it to 2 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate AI explanation.";
  }
}

export async function askCloudCostQuestion(question: string, dataSummary: any) {
  if (!API_KEY) return "AI chat unavailable (API Key missing).";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are a Cloud FinOps Expert. Answer the user's question based on the following infrastructure summary:
    
    ${JSON.stringify(dataSummary, null, 2)}
    
    User Question: ${question}
    
    Provide a helpful, professional, and data-driven response. Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to connect to AI expert.";
  }
}
