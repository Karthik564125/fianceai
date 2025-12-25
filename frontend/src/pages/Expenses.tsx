import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, X, DollarSign, Calendar, Loader } from "lucide-react";
import toast from "react-hot-toast";
import LottieIcon from "../components/LottieIcon";
import expensesData from "../assets/animations/expenses.json";
import ConfirmModal from "../components/ConfirmModal";

interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
}

const Expenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ amount: "", category: "Food", description: "", date: "" });
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const categories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Shopping", "Health", "Other"];

    const fetchExpenses = async () => {
        if (!user?.uid) return;
        try {
            const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Expense[];
            setExpenses(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err) {
            console.error(err);
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [user?.uid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;
        try {
            await addDoc(collection(db, "expenses"), {
                userId: user.uid,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: formData.date,
                createdAt: new Date().toISOString()
            });
            setShowModal(false);
            setFormData({ amount: "", category: "Food", description: "", date: "" });
            fetchExpenses();
            toast.success("Expense added successfully!");
        } catch (err) {
            toast.error("Failed to add expense");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, "expenses", deleteId));
            fetchExpenses();
            toast.success("Expense deleted");
            setDeleteId(null);
        } catch (err) {
            toast.error("Failed to delete expense");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500/10 p-3 rounded-2xl">
                        <LottieIcon animationData={expensesData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Expenses</h1>
                        <p className="text-slate-500 dark:text-slate-400">Track and manage your spending.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} /> Add Expense
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader className="animate-spin text-red-500" size={40} />
                </div>
            ) : expenses.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-3xl">
                    <DollarSign size={64} className="mx-auto text-red-500/50 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Expenses Recorded</h3>
                    <p className="text-slate-400 mt-2">Track where your money goes by adding an expense.</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden rounded-2xl">
                    <table className="w-full">
                        <thead className="bg-slate-800/50 text-slate-400 text-left text-sm uppercase tracking-wider">
                            <tr>
                                <th className="py-4 pl-6 font-medium">Category</th>
                                <th className="py-4 font-medium">Description</th>
                                <th className="py-4 font-medium">Date</th>
                                <th className="py-4 pr-6 text-right font-medium">Amount</th>
                                <th className="py-4 pr-6 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="py-4 pl-6 font-medium text-slate-200 flex items-center gap-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                                            <div className="w-4 h-4 rounded-full bg-current opacity-50" />
                                        </div>
                                        {expense.category}
                                    </td>
                                    <td className="py-4 text-slate-400 truncate max-w-[200px]">{expense.description || "-"}</td>
                                    <td className="py-4 text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6 text-right font-bold text-red-400 text-lg">-₹{expense.amount}</td>
                                    <td className="py-4 pr-6 text-right">
                                        <button onClick={() => setDeleteId(expense.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-blob">
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white hover:rotate-90 transition-all">
                                <X size={24} />
                            </button>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
                                <p className="text-slate-400 text-sm">Where did the money go?</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                        <input
                                            type="number"
                                            required
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Category</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={`py-2 rounded-xl text-sm font-medium transition-all ${formData.category === cat
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Note (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                        placeholder="What was this for?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
                                >
                                    Save Expense
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Expense"
                message="Are you sure you want to delete this expense? This action cannot be undone."
            />
        </div >
    );
};

export default Expenses;
