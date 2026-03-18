import express from "express";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import { analyzeInfrastructure } from "./src/server/optimizer";
import { detectAnomalies } from "./src/server/anomaly_detector";
import { getOptimizationExplanation, askCloudCostQuestion } from "./src/server/ai_engine";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    console.log("POST /api/analyze - Received data");
    try {
      const { data } = req.body;
      if (!data || !Array.isArray(data)) {
        console.error("Invalid data received:", data);
        return res.status(400).json({ error: "Invalid data format. Expected an array." });
      }

      const recommendations = analyzeInfrastructure(data);
      const anomalies = detectAnomalies(data);
      
      const enhancedRecommendations = recommendations.map(rec => ({
        ...rec,
        isAnomaly: anomalies.some(a => a.instanceId === rec.instanceId)
      }));

      console.log(`Analysis complete. Generated ${enhancedRecommendations.length} recommendations.`);
      res.json({ 
        recommendations: enhancedRecommendations,
        anomalies 
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Analysis failed internally" });
    }
  });

  app.post("/api/explain", async (req, res) => {
    console.log("POST /api/explain - Request for", req.body.instanceId);
    try {
      const { instanceId, instanceType, cpu, action } = req.body;
      const explanation = await getOptimizationExplanation(instanceId, instanceType, cpu, action);
      res.json({ explanation });
    } catch (error) {
      console.error("Explain error:", error);
      res.status(500).json({ error: "Failed to generate explanation" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    console.log("POST /api/chat - Question received");
    try {
      const { question, dataSummary } = req.body;
      const answer = await askCloudCostQuestion(question, dataSummary);
      res.json({ answer });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
