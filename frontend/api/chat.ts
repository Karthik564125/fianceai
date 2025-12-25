import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { question, summary } = req.body;

        if (!question || !summary) {
            return res.status(400).json({ error: "Question and summary are required" });
        }

        // Build a strong finance-specific prompt for Indian users
        const prompt = `
You are a personal finance assistant for an Indian user.

User financial summary:
- Total income: ₹${summary.totalIncome}
- Total expense: ₹${summary.totalExpense}
- Monthly savings: ₹${summary.savings}
- Monthly budget limit: ₹${summary.budget}
- Budget used: ${summary.budgetUsedPercentage?.toFixed(1) || 0}%

User question:
"${question}"

Give:
- Simple explanation of their current savings and situation
- Beginner-friendly investment options specific to India
- Comparison of Digital Gold, Digital Silver, Mutual Funds, Stocks, and FDs
- Mention approximate Indian FD interest ranges (usually 6-8%)
- Be educational, encouraging, and beginner-friendly
- End with the disclaimer: "This is not financial advice"
`;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY missing in environment variables");
            return res.status(500).json({ error: "Gemini API key is not configured on the server" });
        }

        // Using gemini-1.5-flash as it is the current compatible model for v1beta, 
        // fallback to gemini-pro if required, but flash is faster/more reliable for this use case.
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ error: data.error.message || "Gemini API failure" });
        }

        const aiText =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn’t generate a response.";

        res.status(200).json({ reply: aiText });
    } catch (err: any) {
        console.error("Chat API Internal Error:", err);
        res.status(500).json({ error: "AI processing error" });
    }
}
