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

/* ---------------- GEMINI API ROUTE ---------------- */

app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    console.log("Sending request to Gemini...");

    // Model from .env or fallback
    const model =
      process.env.GEMINI_MODEL || "models/gemini-2.5-flash";

    console.log("Using model:", model);

    // Gemini API request
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are a helpful coding assistant integrated into Flash IDE.

Rules:
- Always wrap code inside markdown code blocks.
- Use proper language identifiers like \`\`\`html, \`\`\`css, \`\`\`javascript.
- Explain code clearly when needed.
- Return clean and production-ready code.

User Prompt:
${prompt}
                `,
              },
            ],
          },
        ],

        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Gemini responded:", response.status);

    // Extract text safely
    const result =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    res.json({ result });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || error.message;

    console.error("Gemini API Error:", {
      status,
      data,
      message: error.message,
    });

    res.status(status).json({
      error: data,
    });
  }
});

/* ---------------- LIST AVAILABLE MODELS ---------------- */

app.get("/api/models", async (req, res) => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "ListModels Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to list models",
    });
  }
});

/* ---------------- REACT FRONTEND ROUTE ---------------- */

app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../ide/dist/index.html")
  );
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});