import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, X, IndianRupee, Calendar, AlertTriangle, Pencil, Search, Filter } from "lucide-react";
import Skeleton from "../components/Skeleton";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    const categories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Shopping", "Health", "Other"];

    const fetchData = async () => {
        if (!user?.uid) return;
        try {
            const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Expense[];
            const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setExpenses(sortedData);

            const total = sortedData.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            setTotalExpense(total);

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

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exp.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "All" || exp.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="pb-24 md:pb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500/10 p-3 rounded-2xl shrink-0">
                        <LottieIcon animationData={expensesData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Expenses</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-tight">Track every penny you spend.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    {budgetStatus !== null && (
                        <div className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl border flex items-center justify-center gap-2 ${(budgetStatus as number) < 0 ? 'bg-red-500/10 border-red-500/20 text-red-500 font-bold animate-pulse' : 'bg-slate-800/50 border-slate-700/50 text-slate-300'}`}>
                            {(budgetStatus as number) < 0 ? <AlertTriangle size={16} className="shrink-0" /> : <IndianRupee size={16} className="shrink-0" />}
                            <span className="text-xs font-black uppercase tracking-wider">
                                {budgetStatus < 0 ? `Limit Hit! -₹${Math.abs(budgetStatus as number).toLocaleString()}` : `Budget Balance: ₹${(budgetStatus as number).toLocaleString()}`}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setEditId(null);
                            setFormData({ amount: "", category: "Food", description: "", date: "" });
                            setShowModal(true);
                        }}
                        className="hidden md:flex w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-2xl items-center justify-center gap-2 transition-all font-black shadow-xl shadow-red-600/30 uppercase text-xs tracking-widest"
                    >
                        <Plus size={18} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Mobile FAB */}
            <button
                onClick={() => {
                    setEditId(null);
                    setFormData({ amount: "", category: "Food", description: "", date: "" });
                    setShowModal(true);
                }}
                className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 z-[50] active:scale-90 transition-transform border-4 border-slate-900"
            >
                <Plus size={28} />
            </button>

            {loading ? (
                <div className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <Skeleton className="h-12 flex-1" />
                        <Skeleton className="h-12 w-32" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-3xl" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by description or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-red-500/50 transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="relative min-w-[160px]">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-10 text-white focus:outline-none focus:border-red-500/50 transition-all font-black uppercase text-[10px] tracking-widest appearance-none cursor-pointer"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {filteredExpenses.length === 0 ? (
                        <div className="glass-card p-12 md:p-20 text-center rounded-[2.5rem] border border-slate-700/30">
                            <div className="w-20 h-20 bg-red-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/10">
                                <IndianRupee size={32} className="text-red-500/40" />
                            </div>
                            <h3 className="text-2xl font-black text-white">Empty Wallet</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">No expenses found matching your criteria.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block glass-card overflow-hidden rounded-[2rem] border border-slate-700/30">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="bg-slate-800/40 text-slate-500 text-left text-[10px] uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="py-6 pl-8 font-black">Category</th>
                                                <th className="py-6 font-black">Description</th>
                                                <th className="py-6 font-black">Date</th>
                                                <th className="py-6 pr-8 text-right font-black">Amount</th>
                                                <th className="py-6 pr-8 text-right font-black">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {filteredExpenses.map((expense) => (
                                                <tr key={expense.id} className="hover:bg-slate-800/20 transition-colors group">
                                                    <td className="py-6 pl-8 font-black text-slate-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                                                            {expense.category}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 text-slate-400 text-sm font-medium">{expense.description || "-"}</td>
                                                    <td className="py-6 text-slate-400 text-sm font-medium">
                                                        <div className="flex items-center gap-2 opacity-60">
                                                            <Calendar size={14} />
                                                            {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 pr-8 text-right font-black text-red-400 text-lg">
                                                        -₹{expense.amount.toLocaleString()}
                                                    </td>
                                                    <td className="py-6 pr-8 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleEdit(expense)} className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
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

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {filteredExpenses.map((expense) => (
                                    <div key={expense.id} className="glass-card p-5 rounded-3xl border border-slate-700/30 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 font-black shrink-0">
                                                    {expense.category[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black">{expense.category}</h4>
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mt-0.5">
                                                        <Calendar size={10} />
                                                        {new Date(expense.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-red-400 font-black text-lg">-₹{expense.amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-xs font-medium bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">{expense.description || "No note added"}</p>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button onClick={() => handleEdit(expense)} className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-slate-700/30">
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button onClick={() => setDeleteId(expense.id)} className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-red-500/20">
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-blob">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white hover:rotate-90 transition-all">
                            <X size={24} />
                        </button>

                        <div className="mb-4">
                            <h2 className="text-xl font-black text-white">{editId ? "Edit Expense" : "Add New Expense"}</h2>
                            <p className="text-slate-400 text-xs">Where did the money go?</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5 ml-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-all font-bold text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5 ml-1">Category</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat })}
                                            className={`py-1.5 rounded-xl text-[10px] font-black transition-all border ${formData.category === cat
                                                ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700 hover:border-slate-600'
                                                } `}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5 ml-1">Note (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-all text-sm font-medium"
                                    placeholder="What was this for?"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5 ml-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-all text-sm font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-2xl font-black transition-all shadow-xl shadow-red-600/30 text-xs uppercase tracking-widest mt-2"
                            >
                                {editId ? "Update" : "Save"} Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Expense"
                message="Are you sure you want to delete this expense? This action cannot be undone."
            />
        </div>
    );
};

export default Expenses;
