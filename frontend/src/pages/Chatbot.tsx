import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, Send } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import aiData from "../assets/animations/ai.json";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
    const { user } = useAuth();
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [financialData, setFinancialData] = useState<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchContext = async () => {
            if (!user?.uid) return;
            const incomeSnapshot = await getDocs(query(collection(db, "incomes"), where("userId", "==", user.uid)));
            const totalIncome = incomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
            const expenseSnapshot = await getDocs(query(collection(db, "expenses"), where("userId", "==", user.uid)));
            const totalExpense = expenseSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const budget = userDoc.data()?.budget || 0;
            setFinancialData({ totalIncome, totalExpense, budget, savings: totalIncome - totalExpense });
        };
        fetchContext();
    }, [user?.uid]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleSendChat = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const userMsg = chatInput;
        setChatInput("");
        setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setChatLoading(true);
        try {
            const { sendChatMessage } = await import("../services/chatService");
            const reply = await sendChatMessage(userMsg, financialData);
            setChatMessages(prev => [...prev, { role: "ai", text: reply }]);
        } catch (err: any) {
            setChatMessages(prev => [...prev, { role: "ai", text: "Failed to reach AI. Please try again." }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-teal-500/10 p-3 rounded-2xl border border-teal-500/20">
                        <LottieIcon animationData={aiData} size={48} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white">AI Financial Assistant</h1>
                        <p className="text-slate-500 dark:text-slate-400">Ask anything about your budget, savings, or investments.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 glass-card rounded-3xl border border-slate-700/50 overflow-hidden flex flex-col shadow-2xl relative">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-10">
                            <div className="p-6 bg-teal-500/5 rounded-full mb-6 relative">
                                <div className="absolute inset-0 bg-teal-500/10 blur-2xl rounded-full" />
                                <MessageSquare size={80} className="text-teal-400 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">How can I help you today?</h3>
                            <p className="text-slate-400 max-w-md">"What is my current savings?" or "How much have I spent on food this month?"</p>
                        </div>
                    )}

                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${msg.role === "user"
                                ? "bg-teal-600 text-white shadow-teal-600/20"
                                : "bg-slate-800/80 border border-slate-700/50 text-slate-200"
                                }`}>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {chatLoading && (
                        <div className="flex gap-2 items-center text-xs text-teal-500 font-black uppercase tracking-widest bg-teal-500/5 py-2 px-4 rounded-full w-fit animate-pulse">
                            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
                            AI is thinking
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900/80 border-t border-slate-700/50 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                            placeholder="Type your message here..."
                            className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder:text-slate-600 transition-all text-lg font-medium"
                        />
                        <button
                            onClick={handleSendChat}
                            disabled={chatLoading}
                            className="bg-teal-600 hover:bg-teal-500 text-white p-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-teal-600/30 group"
                        >
                            <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
