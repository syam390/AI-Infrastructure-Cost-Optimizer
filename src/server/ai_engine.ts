import { GoogleGenAI } from "@google/genai";

function getApiKey() {
  return process.env.CUSTOM_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
}

function validateApiKey() {
  const key = getApiKey();
  if (!key || key === "YOUR_API_KEY" || key === "MY_GEMINI_API_KEY" || key === "AI Studio Free Tier") {
    console.error("GEMINI_API_KEY is missing or invalid in environment variables.");
    return false;
  }
  return true;
}

export async function getOptimizationExplanation(instanceId: string, instanceType: string, cpu: number, action: string) {
  if (!validateApiKey()) {
    throw new Error("AI explanation unavailable. Please configure CUSTOM_GEMINI_API_KEY in Settings > Secrets with a real API key.");
  }

  const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
      contents: prompt,
    });
    return response.text || "No explanation generated.";
  } catch (error: any) {
    console.error("Gemini API Error in getOptimizationExplanation:", error);
    throw new Error(`Failed to generate AI explanation. Details: ${error?.message || String(error)}`);
  }
}

export async function askCloudCostQuestion(question: string, dataSummary: any) {
  if (!validateApiKey()) {
    throw new Error("AI chat unavailable. Please configure CUSTOM_GEMINI_API_KEY in Settings > Secrets with a real API key.");
  }

  const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
      contents: prompt,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini API Error in askCloudCostQuestion:", error);
    throw new Error(`Failed to connect to AI expert. Details: ${error?.message || String(error)}`);
  }
}
