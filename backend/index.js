import "dotenv/config";
import express from "express";
import cors from "cors";

// Node 18+ / Node 20 has fetch built-in
const app = express();

app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get("/health", (req, res) => {
    res.json({ status: "Backend is running" });
});

/**
 * AI Chat endpoint (Gemini)
 * POST /chat
 */
app.post("/chat", async (req, res) => {
    try {
        const { question, summary } = req.body;

        if (!question) {
            return res.status(400).json({ reply: "Question is required" });
        }

        const prompt = `
You are a professional financial assistant. Provide concise, helpful advice based on this data:
Income: ₹${summary?.totalIncome || 0}, Expense: ₹${summary?.totalExpense || 0}, Savings: ₹${summary?.savings || 0}, Budget: ₹${summary?.budget || 0}

User Question: "${question}"

Rule: 
1. Keep response extremely brief (max 3 sentences).
2. Use a structured format: direct answer first, then 1-2 small bullet points if needed.
3. Use Markdown (bold, lists).
4. End with: "Not financial advice."
`;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ reply: "Gemini API key missing" });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("GEMINI API ERROR:", JSON.stringify(data, null, 2));
            return res.status(response.status).json({
                reply: `AI error: ${data?.error?.message || "Unknown error"}`
            });
        }

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ??
            "AI could not generate a response. Please try again.";

        return res.json({ reply });

    } catch (err) {
        console.error("AI SERVER ERROR:", err);
        return res.status(500).json({
            reply: "AI server error. Please try again later.",
        });
    }
});

/**
 * Server start
 */
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
