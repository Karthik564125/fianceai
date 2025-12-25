import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, X, CheckCircle, Calendar, Loader } from "lucide-react";
import toast from "react-hot-toast";
import LottieIcon from "../components/LottieIcon";
import upcomingData from "../assets/animations/upcoming.json";
import ConfirmModal from "../components/ConfirmModal";

interface Payment {
    id: string;
    title: string;
    amount: number;
    dueDate: string;
    isPaid: boolean;
}

const UpcomingPayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: "", amount: "", dueDate: "" });
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchPayments = async () => {
        if (!user?.uid) return;
        try {
            const q = query(collection(db, "upcomingPayments"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Payment[];
            setPayments(data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
        } catch (err) {
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [user?.uid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;
        try {
            await addDoc(collection(db, "upcomingPayments"), {
                userId: user.uid,
                title: formData.title,
                amount: parseFloat(formData.amount),
                dueDate: formData.dueDate,
                isPaid: false,
                createdAt: new Date().toISOString()
            });
            setShowModal(false);
            setFormData({ title: "", amount: "", dueDate: "" });
            fetchPayments();
            toast.success("Payment scheduled!");
        } catch (err) {
            toast.error("Failed to schedule payment");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, "upcomingPayments", deleteId));
            fetchPayments();
            toast.success("Payment deleted");
            setDeleteId(null);
        } catch (err) {
            toast.error("Failed to delete payment");
        }
    };

    const togglePaid = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "upcomingPayments", id), {
                isPaid: !currentStatus
            });
            fetchPayments();
            toast.success("Payment status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-purple-500/10 p-3 rounded-2xl">
                        <LottieIcon animationData={upcomingData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Upcoming Payments</h1>
                        <p className="text-slate-500 dark:text-slate-400">Never miss a due date again.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} /> Add Payment
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader className="animate-spin text-purple-500" size={40} />
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <div key={payment.id} className="glass-card p-4 rounded-xl flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${payment.isPaid ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                    {payment.isPaid ? <CheckCircle size={24} /> : <Calendar size={24} />}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${payment.isPaid ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>{payment.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg text-slate-800 dark:text-white">₹{payment.amount}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => togglePaid(payment.id, payment.isPaid)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${payment.isPaid
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/20'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20'
                                            }`}
                                    >
                                        {payment.isPaid ? 'PAID' : 'PENDING'}
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(payment.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && payments.length === 0 && (
                <div className="glass-card p-12 text-center rounded-3xl border border-purple-500/10">
                    <Calendar size={64} className="mx-auto text-purple-500/50 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Upcoming Payments</h3>
                    <p className="text-slate-400 mt-2">Never miss a due date by scheduling your payments here.</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-blob">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white hover:rotate-90 transition-all">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-1 text-white">Schedule Payment</h2>
                        <p className="text-slate-400 text-sm mb-6">Never miss a bill again.</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Netflix Subscription"
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-800 border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/30 mt-2">
                                Schedule Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Payment"
                message="Are you sure you want to delete this upcoming payment?"
            />
        </div>
    );
};

export default UpcomingPayments;
