import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ reply: "Method not allowed" });
    }

    try {
        const { question, summary } = req.body;

        if (!question) {
            return res.status(400).json({ reply: "Question is required" });
        }

        const prompt = `
You are a personal finance assistant for an Indian user.

User financial summary:
- Total income: ₹${summary?.totalIncome || 0}
- Total expense: ₹${summary?.totalExpense || 0}
- Monthly savings: ₹${summary?.savings || 0}
- Monthly budget limit: ₹${summary?.budget || 0}

User question:
"${question}"

Give beginner-friendly advice.
Include digital gold, mutual funds, stocks, FD comparison.
Mention FD interest (approx 6–8%).
End with: This is not financial advice.
`;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ reply: "Gemini API key missing" });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
            apiKey,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

        // 🔍 Debug log (temporary)
        console.log("Gemini raw response:", JSON.stringify(data));

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ??
            "AI could not generate a response. Please try again.";

        return res.status(200).json({ reply });

    } catch (err) {
        console.error("AI SERVER ERROR:", err);
        return res.status(500).json({
            reply: "AI server error. Please try again later.",
        });
    }
}
