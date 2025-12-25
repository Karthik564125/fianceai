import { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import aiData from "../assets/animations/ai.json";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

type ChatMessage = {
    role: "user" | "ai";
    text: string;
};

const Chatbot = () => {
    const { user } = useAuth();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [financeData, setFinanceData] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUserFinanceData = async () => {
        if (!user?.uid) return;
        try {
            const incomeQuery = query(collection(db, "incomes"), where("userId", "==", user.uid));
            const incomeSnapshot = await getDocs(incomeQuery);
            const totalIncome = incomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            const expenseQuery = query(collection(db, "expenses"), where("userId", "==", user.uid));
            const expenseSnapshot = await getDocs(expenseQuery);
            const totalExpense = expenseSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const budget = userDoc.data()?.budget || 0;

            const savings = totalIncome - totalExpense;
            const budgetUsedPercentage = budget > 0 ? (totalExpense / budget) * 100 : 0;

            setFinanceData({
                totalIncome,
                totalExpense,
                savings,
                budget,
                budgetUsedPercentage
            });
        } catch (err) {
            console.error("Error fetching finance data for AI:", err);
        }
    };

    useEffect(() => {
        fetchUserFinanceData();
    }, [user?.uid]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput("");
        setLoading(true);

        // show user message immediately
        setMessages((prev: ChatMessage[]) => [...prev, { role: "user", text: userMessage }]);

        try {
            const summary = financeData || {
                totalIncome: 0,
                totalExpense: 0,
                savings: 0,
                budget: 0,
                budgetUsedPercentage: 0
            };

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: userMessage,
                    summary,
                }),
            });

            // Check if response is actually JSON before parsing
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                let errorMsg = "The AI server is not running locally. ";
                if (window.location.hostname === "localhost") {
                    errorMsg += "Please use 'vercel dev' instead of 'npm run dev' to test the chatbot locally.";
                } else {
                    errorMsg += "Server error (non-JSON response).";
                }
                throw new Error(errorMsg);
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch AI response");
            }

            setMessages((prev: ChatMessage[]) => [
                ...prev,
                { role: "ai", text: data.reply || "No response from AI." },
            ]);
        } catch (err: any) {
            console.error("Chatbot Error:", err);
            setMessages((prev: ChatMessage[]) => [
                ...prev,
                { role: "ai", text: err.message || "Something went wrong. Try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[80vh] text-center px-4">
            {/* AI Animation Header */}
            <div className="bg-teal-500/10 p-6 rounded-full mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-500/20 blur-2xl group-hover:bg-teal-500/30 transition-all duration-500" />
                <LottieIcon animationData={aiData} size={180} />
            </div>

            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
                FinanceAI Chatbot
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                Ask anything about your expenses, savings, investments, or financial planning.
            </p>

            {/* Feature Cards */}
            <div className="mb-8 flex flex-wrap justify-center gap-4">
                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                    <MessageSquare className="text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                        Natural Language Queries
                    </span>
                </div>
                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                    <MessageSquare className="text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                        Smart Financial Insights
                    </span>
                </div>
            </div>

            {/* Chat Container */}
            <div className="w-full max-w-2xl flex flex-col">
                {/* Messages */}
                <div className="flex-1 space-y-4 mb-4 text-left">
                    {messages.length === 0 && (
                        <div className="text-slate-400 text-center">
                            Try asking:
                            <br />
                            “How much did I save this month?”
                            <br />
                            “Where should I invest?”
                        </div>
                    )}

                    {messages.map((msg: ChatMessage, index: number) => (
                        <div
                            key={index}
                            className={`max-w-[80%] p-4 rounded-xl ${msg.role === "user"
                                ? "ml-auto bg-teal-500 text-white"
                                : "mr-auto bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
                                }`}
                        >
                            {msg.text}
                        </div>
                    ))}

                    {loading && (
                        <div className="mr-auto bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white p-4 rounded-xl">
                            AI is thinking…
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask about savings, investments, budget..."
                        className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="px-5 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
