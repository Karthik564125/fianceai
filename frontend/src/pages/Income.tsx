import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, X, Wallet, Calendar, Loader, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import LottieIcon from "../components/LottieIcon";
import incomeData from "../assets/animations/income.json";
import ConfirmModal from "../components/ConfirmModal";

interface Income {
    id: string;
    amount: number;
    source: string;
    date: string;
    note?: string;
}

const Income = () => {
    const { user } = useAuth();
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ amount: "", source: "Salary", date: "", note: "" });
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);

    const sources = ["Salary", "Freelance", "Investment", "Gift", "Bonus", "Other"];

    const fetchIncomes = async () => {
        if (!user?.uid) return;
        try {
            const q = query(collection(db, "incomes"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Income[];
            setIncomes(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err) {
            toast.error("Failed to load incomes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, [user?.uid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;
        try {
            if (editId) {
                await updateDoc(doc(db, "incomes", editId), {
                    amount: parseFloat(formData.amount),
                    source: formData.source,
                    date: formData.date,
                    note: formData.note,
                });
                toast.success("Income updated successfully!");
            } else {
                await addDoc(collection(db, "incomes"), {
                    userId: user.uid,
                    amount: parseFloat(formData.amount),
                    source: formData.source,
                    date: formData.date,
                    note: formData.note,
                    createdAt: new Date().toISOString()
                });
                toast.success("Income added successfully!");
            }
            setShowModal(false);
            setFormData({ amount: "", source: "Salary", date: "", note: "" });
            setEditId(null);
            fetchIncomes();
        } catch (err) {
            console.error("Firebase Error:", err);
            toast.error(editId ? "Failed to update income" : "Failed to add income");
        }
    };

    const handleEdit = (income: Income) => {
        setFormData({
            amount: income.amount.toString(),
            source: income.source,
            date: income.date,
            note: income.note || ""
        });
        setEditId(income.id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        // ... existing
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, "incomes", deleteId));
            fetchIncomes();
            toast.success("Income deleted");
            setDeleteId(null);
        } catch (err) {
            toast.error("Failed to delete income");
        }
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl shrink-0">
                        <LottieIcon animationData={incomeData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Income</h1>
                        <p className="text-slate-500 dark:text-slate-400">Track your earnings and revenue.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ amount: "", source: "Salary", date: "", note: "" });
                        setShowModal(true);
                    }}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-black shadow-lg shadow-emerald-600/20"
                >
                    <Plus size={20} /> Add Income
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center flex-col items-center p-20 gap-4">
                    <Loader className="animate-spin text-emerald-500" size={48} />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Income</p>
                </div>
            ) : incomes.length === 0 ? (
                <div className="glass-card p-12 md:p-20 text-center rounded-[2.5rem] border border-slate-700/50">
                    <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet size={40} className="text-emerald-500/50" />
                    </div>
                    <h3 className="text-2xl font-black text-white">No Income Added</h3>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">Start tracking your earnings by adding a new income source. Watch your balance grow!</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden rounded-3xl border border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-slate-800/50 text-slate-400 text-left text-xs uppercase tracking-widest">
                                <tr>
                                    <th className="py-5 pl-8 font-black">Source</th>
                                    <th className="py-5 font-black">Description</th>
                                    <th className="py-5 font-black">Date</th>
                                    <th className="py-5 pr-8 text-right font-black">Amount</th>
                                    <th className="py-5 pr-8 text-right font-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {incomes.map((income) => (
                                    <tr key={income.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="py-4 pl-6 font-medium text-slate-200 flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                                <Wallet size={18} />
                                            </div>
                                            {income.source}
                                        </td>
                                        <td className="py-4 text-slate-400">{income.note || "-"}</td>
                                        <td className="py-4 text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(income.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-4 pr-6 text-right font-bold text-emerald-400 text-lg">
                                            +₹{income.amount}
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(income)}
                                                    className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Edit Income"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(income.id)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete Income"
                                                >
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
                                <h2 className="text-2xl font-bold text-white">{editId ? "Edit Income" : "Add New Income"}</h2>
                                <p className="text-slate-400 text-sm">Record a new payment received.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-lg font-bold"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Source</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sources.map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, source: s })}
                                                className={`py-2 rounded-xl text-sm font-medium transition-all ${formData.source === s
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Note (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                        placeholder="What was this for?"
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20">
                                    Save Income
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
                title="Delete Income"
                message="Are you sure you want to delete this income record?"
            />
        </div >
    );
};

export default Income;
