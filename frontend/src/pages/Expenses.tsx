import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, X, IndianRupee, Calendar, Loader, AlertTriangle, Pencil } from "lucide-react";
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
    const [budget, setBudget] = useState<number>(0);
    const [totalExpense, setTotalExpense] = useState<number>(0);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ amount: "", category: "Food", description: "", date: "" });
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);

    const categories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Shopping", "Health", "Other"];

    const fetchData = async () => {
        // ... existing
        if (!user?.uid) return;
        try {
            // Fetch Expenses
            const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Expense[];
            const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setExpenses(sortedData);

            // Calculate Total
            const total = sortedData.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            setTotalExpense(total);

            // Fetch Budget
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            setBudget(userDoc.data()?.budget || 0);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.uid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;
        try {
            const amount = parseFloat(formData.amount);

            if (editId) {
                await updateDoc(doc(db, "expenses", editId), {
                    amount: amount,
                    category: formData.category,
                    description: formData.description,
                    date: formData.date
                });
                toast.success("Expense updated successfully!");
                setEditId(null);
            } else {
                await addDoc(collection(db, "expenses"), {
                    userId: user.uid,
                    amount: amount,
                    category: formData.category,
                    description: formData.description,
                    date: formData.date,
                    createdAt: new Date().toISOString()
                });

                const remaining = budget - (totalExpense + amount);
                if (budget > 0) {
                    if (remaining < 0) {
                        toast.error(`Budget Exceeded! You are ₹${Math.abs(remaining).toLocaleString()} over.`);
                    } else {
                        toast.success(`Expense added! ₹${remaining.toLocaleString()} budget left.`);
                    }
                } else {
                    toast.success("Expense added successfully!");
                }
            }

            setShowModal(false);
            setFormData({ amount: "", category: "Food", description: "", date: "" });
            await fetchData();

        } catch (err) {
            toast.error(editId ? "Failed to update expense" : "Failed to add expense");
        }
    };

    const handleEdit = (expense: Expense) => {
        setFormData({
            amount: expense.amount.toString(),
            category: expense.category,
            description: expense.description || "",
            date: expense.date
        });
        setEditId(expense.id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        // ... existing
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, "expenses", deleteId));
            await fetchData();
            toast.success("Expense deleted");
            setDeleteId(null);
        } catch (err) {
            toast.error("Failed to delete expense");
        }
    };

    const budgetStatus = budget > 0 ? (budget - totalExpense) : null;

    return (
        <div className="pb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500/10 p-3 rounded-2xl shrink-0">
                        <LottieIcon animationData={expensesData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Expenses</h1>
                        <p className="text-slate-500 dark:text-slate-400">Track and manage your spending.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    {budgetStatus !== null && (
                        <div className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border flex items-center justify-center gap-2 ${(budgetStatus as number) < 0 ? 'bg-red-500/10 border-red-500/20 text-red-500 font-bold animate-pulse' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}>
                            {(budgetStatus as number) < 0 ? <AlertTriangle size={18} className="shrink-0" /> : <IndianRupee size={18} className="shrink-0" />}
                            <span className="text-sm">
                                {(budgetStatus as number) < 0 ? `Exceeded by ₹${Math.abs(budgetStatus as number).toLocaleString()}` : `Budget Left: ₹${(budgetStatus as number).toLocaleString()}`}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setEditId(null);
                            setFormData({ amount: "", category: "Food", description: "", date: "" });
                            setShowModal(true);
                        }}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-black shadow-lg shadow-red-600/20"
                    >
                        <Plus size={20} /> Add Expense
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center flex-col items-center p-20 gap-4">
                    <Loader className="animate-spin text-red-500" size={48} />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Expenses</p>
                </div>
            ) : expenses.length === 0 ? (
                <div className="glass-card p-12 md:p-20 text-center rounded-[2.5rem] border border-slate-700/50">
                    <div className="w-20 h-20 bg-red-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IndianRupee size={40} className="text-red-500/50" />
                    </div>
                    <h3 className="text-2xl font-black text-white">No Expenses Recorded</h3>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">Track where your money goes by adding an expense. It only takes a second.</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden rounded-3xl border border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-slate-800/50 text-slate-400 text-left text-xs uppercase tracking-widest">
                                <tr>
                                    <th className="py-5 pl-8 font-black">Category</th>
                                    <th className="py-5 font-black">Description</th>
                                    <th className="py-5 font-black">Date</th>
                                    <th className="py-5 pr-8 text-right font-black">Amount</th>
                                    <th className="py-5 pr-8 text-right font-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="py-5 pl-8 font-black text-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                                                {expense.category}
                                            </div>
                                        </td>
                                        <td className="py-5 text-slate-400 text-sm">{expense.description || "-"}</td>
                                        <td className="py-5 text-slate-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="opacity-50" />
                                                {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="py-5 pr-8 text-right font-black text-red-400 text-lg">
                                            -₹{expense.amount.toLocaleString()}
                                        </td>
                                        <td className="py-5 pr-8 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleEdit(expense)} className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => setDeleteId(expense.id)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                                <h2 className="text-2xl font-bold text-white">{editId ? "Edit Expense" : "Add New Expense"}</h2>
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
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-bold"
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
                                                className={`py-2 rounded-xl text-xs font-black transition-all border ${formData.category === cat
                                                    ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600'
                                                    } `}
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
                                    className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-600/30 text-lg mt-2"
                                >
                                    {editId ? "Update Expense" : "Save Expense"}
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
