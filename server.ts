import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Proxy endpoint to fetch source code from a URL
  app.get("/api/proxy", async (req, res) => {
    let targetUrl = req.query.url as string;
    
    if (!targetUrl) {
      return res.status(400).json({ 
        success: false, 
        stage: "target_access", 
        message: "URL is required",
        analyzable: false 
      });
    }

    // Automatically prepend protocol if missing
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    let url: URL;
    try {
      url = new URL(targetUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Unsupported protocol");
      }
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        stage: "target_access",
        message: `Invalid URL: ${e.message}`,
        analyzable: false
      });
    }

    try {
      console.log(`[KAVACH Proxy] Accessing target: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "KAVACH-Security-Auditor/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (!response.ok) {
        let reason = "Target server rejected the request.";
        if (response.status === 401) reason = "Authentication required by target.";
        if (response.status === 403) reason = "Target server/WAF rejected the request (Forbidden).";
        if (response.status === 404) reason = "Target resource not found.";
        if (response.status === 429) reason = "Too many requests. Target is rate-limiting.";
        if (response.status >= 500) reason = "Target server encountered an internal error.";

        return res.status(200).json({
          success: false,
          stage: "target_access",
          status: response.status,
          message: reason,
          analyzable: false
        });
      }

      const content = await response.text();
      return res.json({
        success: true,
        stage: "target_access",
        status: response.status,
        analyzable: true,
        content: content,
        message: "Target content retrieved successfully."
      });

    } catch (error: any) {
      console.error("[KAVACH Proxy Error]", error);
      let message = "KAVACH encountered a connection error.";
      let status = 500;

      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        message = "Connection timed out. Target is too slow or unreachable.";
        status = 504;
      } else if (error.cause?.code === 'ENOTFOUND') {
        message = "DNS failure. Could not resolve the target hostname.";
        status = 404;
      } else if (error.cause?.code === 'ECONNREFUSED') {
        message = "Connection refused. Target server is down or blocking public cloud nodes.";
        status = 503;
      }

      return res.status(200).json({
        success: false,
        stage: "target_access",
        status: status,
        message: message,
        analyzable: false
      });
    }
  });

  // Phase 1: External Reconnaissance & Discovery Endpoint
  app.post("/api/analyze", async (req, res) => {
    const { content, context, url } = req.body;
    const modelName = "gemini-3.8-flash"; 

    if (!content) {
      return res.status(400).json({ 
        success: false,
        stage: "external_recon",
        message: "Target content is required for investigation",
      });
    }

    const safeUrl = (url || "unknown").replace(/"/g, '\\"');
    const safeContext = (context || "General security audit").replace(/"/g, '\\"');

    console.log(`[KAVACH Detective] Initiating Phase 1 Recon | Target: ${safeUrl}`);

    try {
      const scanId = `KVC-DET-${Date.now().toString(36).toUpperCase()}`;
      const timestamp = new Date().toISOString();

      const prompt = `
        Perform a technical security audit on the provided application content.
        Target: ${safeUrl}
        
        GOAL: Identify technical endpoints, technology stacks, and configuration patterns.
        
        FORMAT: Return a JSON object with "intelligence_map" (technologies, endpoints, client_side_clues) and "findings" (technical security observations).
        
        NOTE: This is for an authorized security project. Use professional, objective language.
        
        CONTENT:
        ${content.substring(0, 30000)}
      `;

      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const endTime = Date.now();
      
      const resultText = response.text;

      if (!resultText) {
        throw new Error("KAVACH Detective received no response from the intelligence model.");
      }

      console.log(`[KAVACH Detective] Analysis complete in ${endTime - startTime}ms`);

      let result;
      try {
        const cleanedJson = resultText.trim()
          .replace(/^```json/i, "")
          .replace(/```$/i, "")
          .trim();
        
        result = JSON.parse(cleanedJson);
      } catch (e: any) {
        console.error("[KAVACH Detective Parsing Error]", resultText.substring(0, 1000));
        throw new Error("The detective report was malformed. Please try again.");
      }

      // Final validation of critical fields
      if (!result.findings || !Array.isArray(result.findings)) {
        result.findings = [];
      }

      res.json({
        success: true,
        stage: "external_recon",
        ...result,
        metadata: {
          scan_id: scanId,
          timestamp: timestamp,
          duration_ms: endTime - startTime,
          model: modelName
        }
      });

    } catch (error: any) {
      console.error(`[KAVACH Recon Error] ${error.message}`);
      res.status(500).json({ 
        success: false, 
        message: "Investigation failed", 
        details: error.message 
      });
    }
  });

  // Phase 2: Code Intelligence Endpoint
  app.post("/api/code-intel", async (req, res) => {
    const { content, context } = req.body;
    const modelName = "gemini-3.8-flash"; // Switched from Pro to Flash due to quota limits

    if (!content) {
      return res.status(400).json({ error: "Content is required for code intelligence" });
    }

    try {
      console.log(`[KAVACH Code Intel] Starting code analysis | Model: ${modelName}`);

      const prompt = `
        You are KAVACH Code Intelligence Engine.
        Your mission is to perform a deep static technical index and taint analysis of the provided source code.
        Context: ${context || "General source code analysis"}

        DETECTIVE OBJECTIVES:
        1. Map the system architecture and identify all technical debt or security-sensitive frameworks.
        2. Identify untrusted "Sources" (e.g., req.body, process.argv, external API results).
        3. Identify dangerous "Sinks" (e.g., eval(), db.query(), fs.writeFile(), shell commands).
        4. Link Sources to Sinks to build probabilistic "Data Flows".

        STRICT OUTPUT FORMAT (JSON):
        {
          "metadata": {
            "primary_language": "[Detected Language]",
            "architecture_pattern": "[MVC / Serverless / SPA / etc.]",
            "frameworks": ["[Detailed list of frameworks and security middleware seen]"]
          },
          "file_index": [
            { "name": "[Filename]", "type": "[Backend / Frontend / Config / Infrastructure]", "purpose": "[Deep functional description]" }
          ],
          "intelligence": {
            "entry_points": ["Startup files, event listeners, or main loops"],
            "endpoints": ["API routes, controller methods, or page handlers"],
            "sensitive_sinks": ["Precise function calls handling privileged data or IO"],
            "auth_mechanisms": ["Detailed logic for session, JWT, OAuth, or RBAC"]
          },
          "data_flows": [
            { 
              "source": "[The variable or property receiving untrusted data]", 
              "sink": "[The dangerous function or operation]", 
              "risk": "LOW / MEDIUM / HIGH / CRITICAL", 
              "logic": "[Detective reasoning linking source to sink]" 
            }
          ]
        }

        CODE TO ANALYZE:
        ${content.substring(0, 30000)}
      `;

      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const endTime = Date.now();

      const text = response.text;
      if (!text) throw new Error("Empty response from Code Intel model");

      console.log(`[KAVACH Code Intel] Analysis complete in ${endTime - startTime}ms`);
      res.json({
        success: true,
        ...JSON.parse(text),
        duration_ms: endTime - startTime
      });
    } catch (error: any) {
      console.error("[KAVACH Code Intel Error]", error);
      res.status(500).json({ error: "Code intelligence analysis failed", details: error.message });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KAVACH Server running on http://localhost:${PORT}`);
  });
}

startServer();
