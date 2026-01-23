import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Backend is running" });
});

app.post("/chat", async (req, res) => {
    try {
        const { question, summary } = req.body;

        if (!question) {
            return res.status(400).json({ reply: "Question is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ reply: "Gemini API key missing" });
        }

        const prompt = `
You are a professional financial assistant. Provide concise, helpful advice based on this data:
Income: ₹${summary?.totalIncome || 0}, Expense: ₹${summary?.totalExpense || 0}, Savings: ₹${summary?.savings || 0}, Budget: ₹${summary?.budget || 0}

User Question: "${question}"

Rule: 
1. Keep response extremely brief (max 10 sentences).
2. Use a structured format: direct answer first, then 1-2 small bullet points if needed.
3. Use Markdown (bold, lists).
4. Give clear, practical advice with moderate detail (5–8 sentences).
5. Use structured format: short heading, then bullet points.
6. Be specific (mention examples like mutual funds, ETFs, gold, RD, FD, etc when relevant).
7. Avoid generic fluff.
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
            console.error("GEMINI API ERROR:", data);
            return res.status(500).json({
                reply: data?.error?.message || "Gemini API error",
            });
        }

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response generated.";

        res.json({ reply });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ reply: "Server error" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
