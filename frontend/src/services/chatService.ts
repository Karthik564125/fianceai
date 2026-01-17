export async function sendChatMessage(
    question: string,
    summary: {
        totalIncome: number;
        totalExpense: number;
        savings: number;
        budget: number;
    }
) {
    // Using relative path /api/chat which is proxied via vite.config.ts to http://backend:5000
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            question,
            summary,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.reply || "Backend AI request failed");
    }

    const data = await response.json();
    return data.reply as string;
}
