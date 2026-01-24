import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, Send, Trash2, AlertTriangle } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import aiData from "../assets/animations/ai.json";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

const Chatbot = () => {
    const { user } = useAuth();
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [financialData, setFinancialData] = useState<any>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Sync chat history from Firebase
    useEffect(() => {
        if (!user?.uid) return;
        const unsubscribe = onSnapshot(doc(db, "ai_chats", user.uid), (docVal) => {
            if (docVal.exists()) {
                const data = docVal.data();
                if (data.messages) {
                    setChatMessages(data.messages);
                }
            } else {
                setChatMessages([]);
            }
        });
        return () => unsubscribe();
    }, [user?.uid]);

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
        if (!chatInput.trim() || chatLoading || !user?.uid) return;

        const text = chatInput;
        const userMsg = { role: "user", text, createdAt: new Date().toISOString() };

        // Optimistic UI update
        setChatInput("");
        setChatMessages(prev => [...prev, userMsg]);
        setChatLoading(true);

        const chatRef = doc(db, "ai_chats", user.uid);

        try {
            // Save user message
            await setDoc(chatRef, {
                messages: arrayUnion(userMsg),
                userId: user.uid,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            const { sendChatMessage } = await import("../services/chatService");
            const reply = await sendChatMessage(text, financialData);

            const aiMsg = { role: "ai", text: reply, createdAt: new Date().toISOString() };

            // Save AI message
            await updateDoc(chatRef, {
                messages: arrayUnion(aiMsg),
                updatedAt: new Date().toISOString()
            });

        } catch (err: any) {
            console.error("Chat error:", err);
            setChatMessages(prev => [...prev, { role: "ai", text: `Error: ${err.message || "Failed to communicate with AI."}` }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleDeleteChat = () => {
        if (!user?.uid || chatMessages.length === 0) return;
        setShowConfirmModal(true);
    };

    const confirmClearChat = async () => {
        if (!user?.uid) return;
        try {
            await setDoc(doc(db, "ai_chats", user.uid), {
                messages: [],
                userId: user.uid,
                updatedAt: new Date().toISOString()
            });
            toast.success("Chat history cleared");
        } catch (err) {
            console.error("Error clearing chat:", err);
            toast.error("Failed to clear chat");
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-teal-500/10 p-2 md:p-3 rounded-2xl border border-teal-500/20 shrink-0">
                        <LottieIcon animationData={aiData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">AI Assistant</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">Ask about your budget, savings, or investments.</p>
                    </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-amber-500/80 bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-500/10 w-full md:w-auto">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span className="font-medium leading-tight">AI responses may be incorrect. Verify important info.</span>
                    </div>

                    {chatMessages.length > 0 && (
                        <button
                            onClick={handleDeleteChat}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-medium border border-red-500/20 text-xs md:text-sm w-full md:w-auto"
                        >
                            <Trash2 size={16} />
                            Clear Chat
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 glass-card rounded-3xl border border-slate-700/50 overflow-hidden flex flex-col shadow-2xl relative">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar">
                    {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-6 md:px-10">
                            <div className="p-4 md:p-6 bg-teal-500/5 rounded-full mb-4 md:mb-6 relative">
                                <div className="absolute inset-0 bg-teal-500/10 blur-2xl rounded-full" />
                                <MessageSquare size={60} className="text-teal-400 relative z-10 md:w-20 md:h-20" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">How can I help you?</h3>
                            <p className="text-slate-400 text-sm md:text-base max-w-md">"What is my current savings?" or "Track expense"</p>
                        </div>
                    )}

                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl shadow-lg ${msg.role === "user"
                                ? "bg-teal-600 text-white shadow-teal-600/20"
                                : "bg-slate-800/80 border border-slate-700/50 text-slate-200"
                                }`}>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-sm md:text-base">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {chatLoading && (
                        <div className="flex gap-2 items-center text-[10px] md:text-xs text-teal-500 font-black uppercase tracking-widest bg-teal-500/5 py-2 px-4 rounded-full w-fit animate-pulse">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-teal-500 rounded-full animate-bounce" />
                            AI is thinking
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 md:p-4 bg-slate-900/80 border-t border-slate-700/50 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto flex gap-2 md:gap-3">
                        <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-950 border border-slate-800 p-3 md:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder:text-slate-600 transition-all text-sm md:text-lg font-medium"
                        />
                        <button
                            onClick={handleSendChat}
                            disabled={chatLoading}
                            className="bg-teal-600 hover:bg-teal-500 text-white p-3 md:p-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-teal-600/30 group shrink-0"
                        >
                            <Send size={20} className="md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmClearChat}
                title="Clear Chat History"
                message="Are you sure you want to delete all messages? This cannot be undone."
            />
        </div>
    );
};

export default Chatbot;
