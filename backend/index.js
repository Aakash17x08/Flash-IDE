import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static assets from the React frontend build
app.use(express.static(path.join(__dirname, "../ide/dist")));

app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Sending request to Gemini...");

    // Model can be configured via .env: GEMINI_MODEL="models/your-model"
    const model = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
    console.log("Using model:", model);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        systemInstruction: {
          parts: [
            {
              text: "You are a helpful coding assistant integrated into Flash IDE. When the user asks for code changes, you must ALWAYS wrap any code output (full files or snippets) in standard GFM markdown code blocks with the correct language identifier (e.g. ```html, ```css, ```javascript). Never return code without wrapping it in markdown code blocks."
            }
          ]
        }
      }
    );

    console.log("Gemini responded", response.status);
    console.log("Gemini response data:", response.data);

    const result =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ result });
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error("Gemini API Error:", { status, data, message: error.message });
    res.status(status || 500).json({ error: data || error.message });
  }
});

// Debug helper: list available models from the Generative Language API
app.get("/api/models", async (req, res) => {
  try {
    const resp = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );
    res.json(resp.data);
  } catch (err) {
    console.error("ListModels Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to list models" });
  }
});

// Wildcard route to serve the React app index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../ide/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
