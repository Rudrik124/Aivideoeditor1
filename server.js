import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ INIT CLAUDE
const anthropic = new Anthropic({
  apiKey: "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",
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ GENERATE ROUTE (CLAUDE)
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    console.log("Received prompt:", prompt);

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // fast + cheap
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Convert this prompt into video editing JSON with:
          - cuts (start & end)
          - style
          - transitions

          Prompt: ${prompt}`,
        },
      ],
    });

    const result = response.content[0].text;

    console.log("Claude Response:", result);

    res.json({
      success: true,
      result: result,
    });

  } catch (error) {
    console.error("Claude Error:", error);

    res.status(500).json({
      success: false,
      error: "Claude failed",
    });
  }
});

// ✅ START SERVER
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});