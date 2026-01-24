export async function sendChatMessage(
    question: string,
    summary: {
        totalIncome: number;
        totalExpense: number;
        savings: number;
        budget: number;
    }
) {
    // Using absolute path to the live backend
    const response = await fetch("https://financeai-backend-exni.onrender.com/chat", {
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
