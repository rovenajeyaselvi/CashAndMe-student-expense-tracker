const path = require("path");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve your existing Cashandme website
app.use(express.static(path.join(__dirname, "public")));
console.log(
  "Gemini API key loaded:",
  Boolean(process.env.GEMINI_API_KEY)
);
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// AI expense assistant endpoint
app.post("/api/parse-expense", async (req, res) => {
  try {
    const { sentence } = req.body;

    if (typeof sentence !== "string" || !sentence.trim()) {
      return res.status(400).json({
        error: "Please describe your expense first.",
      });
    }

    
let response;

for (let attempt = 0; attempt < 3; attempt++) {
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
Extract the expense details from this sentence:
"${sentence.replace(/"/g, '\\"')}"

Return only valid JSON with these fields:
{
  "name": "short expense name",
  "amount": 120,
  "category": "Food",
  "date": "today"
}

Allowed categories: Food, Travel, Shopping, Education, Other.
The amount must be a number.
If the amount is missing or unclear, return null for amount.
Do not invent details that are not supported by the sentence.
`,
      config: {
        responseMimeType: "application/json",
      },
    });

    break;
  } catch (error) {
    const message = error.message || "";

    const isTemporaryError =
      message.includes("503") ||
      message.includes("UNAVAILABLE");

    if (!isTemporaryError || attempt === 2) {
      throw error;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 3000 * (attempt + 1))
    );
  }
}


    const expense = JSON.parse(response.text);

    const allowedCategories = [
      "Food",
      "Travel",
      "Shopping",
      "Education",
      "Other",
    ];

    if (
      typeof expense.name !== "string" ||
      !expense.name.trim() ||
      typeof expense.amount !== "number" ||
      !Number.isFinite(expense.amount) ||
      expense.amount <= 0 ||
      !allowedCategories.includes(expense.category)
    ) {
      return res.status(422).json({
        error: "I couldn't identify all the expense details. Please rephrase it.",
      });
    }

    res.json(expense);
 
} catch (error) {
  console.error("Expense assistant error:", error);

  res.status(500).json({
    error: "The AI assistant couldn't process that expense. Please try again.",
    details: error.message,
  });
}

});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Cashandme is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
