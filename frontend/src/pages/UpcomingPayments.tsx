import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Calendar, Plus, Trash2, CheckCircle, Clock, AlertCircle, Loader2, Pencil } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import upcomingData from "../assets/animations/upcoming.json";

const UpcomingPayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: "", amount: "", date: "", category: "Food" });
    const [editId, setEditId] = useState<string | null>(null);

    const categories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Shopping", "Health", "Other"];

    const fetchPayments = async () => {
        if (!user?.uid) return;
        try {
            const q = query(collection(db, "upcomingPayments"), where("userId", "==", user.uid));
            const snapshot = await getDocs(q);
            setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [user?.uid]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateDoc(doc(db, "upcomingPayments", editId), {
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
                toast.success("Payment updated!");
            } else {
                await addDoc(collection(db, "upcomingPayments"), {
                    ...formData,
                    amount: parseFloat(formData.amount),
                    userId: user.uid,
                    status: "pending"
                });
                toast.success("Payment added!");
            }
            setShowModal(false);
            setFormData({ title: "", amount: "", date: "", category: "Food" });
            setEditId(null);
            fetchPayments();
        } catch (err) {
            toast.error(editId ? "Failed to update payment" : "Failed to add payment");
        }
    };

    const handleEdit = (payment: any) => {
        setFormData({
            title: payment.title,
            amount: payment.amount.toString(),
            date: payment.date,
            category: payment.category
        });
        setEditId(payment.id);
        setShowModal(true);
    };

    const handleDelete = async (id: string, expenseId?: string) => {
        try {
            await deleteDoc(doc(db, "upcomingPayments", id));
            if (expenseId) {
                await deleteDoc(doc(db, "expenses", expenseId));
            }
            toast.success("Payment deleted");
            fetchPayments();
        } catch (err) {
            toast.error("Failed to delete payment");
        }
    };

    const markAsPaid = async (payment: any) => {
        try {
            if (payment.status === "paid") return;

            // 1. Create Expense
            const expenseRef = await addDoc(collection(db, "expenses"), {
                userId: user.uid,
                amount: payment.amount,
                category: payment.category,
                description: `Paid: ${payment.title}`,
                date: payment.date,
                createdAt: new Date().toISOString(),
                upcomingPaymentId: payment.id // Link back
            });

            // 2. Update Upcoming Payment
            await updateDoc(doc(db, "upcomingPayments", payment.id), {
                status: "paid",
                expenseId: expenseRef.id
            });

            toast.success("Payment marked as paid!");
            fetchPayments();
        } catch (err) {
            console.error(err);
            toast.error("Failed to mark as paid");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="space-y-8 pb-24 md:pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                        <LottieIcon animationData={upcomingData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white leading-tight">Upcoming</h1>
                        <p className="text-slate-400 text-sm font-medium tracking-tight">Never miss a payment again.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ title: "", amount: "", date: "", category: "Food" });
                        setShowModal(true);
                    }}
                    className="hidden md:flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all uppercase text-xs tracking-widest"
                >
                    <Plus size={18} /> Add Payment
                </button>
            </div>

            {/* Mobile FAB */}
            <button
                onClick={() => {
                    setEditId(null);
                    setFormData({ title: "", amount: "", date: "", category: "Food" });
                    setShowModal(true);
                }}
                className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 z-[50] active:scale-90 transition-transform border-4 border-slate-900"
            >
                <Plus size={28} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payments.length > 0 ? (
                    payments.map((p) => (
                        <div key={p.id} className="glass-card p-6 rounded-3xl border border-slate-700/50 hover-scale relative group transition-all duration-300">
                            {p.status !== 'paid' && (
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="text-slate-500 hover:text-blue-400 p-2 transition-colors"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id, p.expenseId)}
                                        className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                            <div className={`p-3 rounded-2xl w-fit mb-4 ${p.status === 'paid' ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                                <Calendar size={24} />
                            </div>
                            <h3 className={`text-xl font-bold text-white mb-1 ${p.status === 'paid' ? 'line-through opacity-50' : ''}`}>{p.title}</h3>
                            <p className="text-slate-400 text-sm mb-4">{p.category} • {p.date}</p>
                            <div className="flex items-center justify-between mt-6">
                                <span className={`text-2xl font-black ${p.status === 'paid' ? 'text-red-400 line-through opacity-50' : 'text-white'}`}>₹{p.amount}</span>
                                <button
                                    onClick={() => markAsPaid(p)}
                                    disabled={p.status === 'paid'}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${p.status === 'paid'
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20 cursor-default"
                                        : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                                        }`}
                                >
                                    {p.status === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                    {p.status === 'paid' ? "Paid" : "Mark Paid"}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-slate-800/50 rounded-full mb-4">
                            <AlertCircle size={40} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300">No upcoming payments</h3>
                        <p className="text-slate-500 max-w-xs mt-2">Track your subscriptions and bills to stay ahead of your finances.</p>
                    </div>
                )}
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">{editId ? "Edit Payment" : "Add New Payment"}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Title</label>
                                <input
                                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl mt-1 text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="(Netflix Subscription)"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl mt-1 text-white focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="₹"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Category</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl mt-1 text-white focus:ring-2 focus:ring-primary outline-none appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl mt-1 text-white focus:ring-2 focus:ring-primary outline-none"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
                                <button className="flex-1 bg-primary py-3 rounded-xl font-bold text-white shadow-lg shadow-primary/20">{editId ? "Update Payment" : "Add Payment"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingPayments;
