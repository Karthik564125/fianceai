import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, X, Wallet, Calendar, Pencil, Search, Filter } from "lucide-react";
import Skeleton from "../components/Skeleton";
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

const IncomePage = () => {
    const { user } = useAuth();
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ amount: "", source: "Salary", date: "", note: "" });
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSource, setFilterSource] = useState("All");

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

    const filteredIncomes = incomes.filter(inc => {
        const matchesSearch = (inc.note || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.source.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSource = filterSource === "All" || inc.source === filterSource;
        return matchesSearch && matchesSource;
    });

    return (
        <div className="pb-24 md:pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl shrink-0">
                        <LottieIcon animationData={incomeData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Income</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-tight">Watch your wealth grow.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ amount: "", source: "Salary", date: "", note: "" });
                        setShowModal(true);
                    }}
                    className="hidden md:flex w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl items-center justify-center gap-2 transition-all font-black shadow-xl shadow-emerald-600/30 uppercase text-xs tracking-widest"
                >
                    <Plus size={18} /> Add Income
                </button>
            </div>

            {/* Mobile FAB */}
            <button
                onClick={() => {
                    setEditId(null);
                    setFormData({ amount: "", source: "Salary", date: "", note: "" });
                    setShowModal(true);
                }}
                className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40 z-[50] active:scale-90 transition-transform border-4 border-slate-900"
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
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by note or source..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="relative min-w-[160px]">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <select
                                value={filterSource}
                                onChange={(e) => setFilterSource(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-10 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-black uppercase text-[10px] tracking-widest appearance-none cursor-pointer"
                            >
                                <option value="All">All Sources</option>
                                {sources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {filteredIncomes.length === 0 ? (
                        <div className="glass-card p-12 md:p-20 text-center rounded-[2.5rem] border border-slate-700/30">
                            <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/10">
                                <Wallet size={32} className="text-emerald-500/40" />
                            </div>
                            <h3 className="text-2xl font-black text-white">No Revenue</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">No income matches your search criteria.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block glass-card overflow-hidden rounded-[2rem] border border-slate-700/30">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="bg-slate-800/40 text-slate-500 text-left text-[10px] uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="py-6 pl-8 font-black">Source</th>
                                                <th className="py-6 font-black">Description</th>
                                                <th className="py-6 font-black">Date</th>
                                                <th className="py-6 pr-8 text-right font-black">Amount</th>
                                                <th className="py-6 pr-8 text-right font-black">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {filteredIncomes.map((income) => (
                                                <tr key={income.id} className="hover:bg-slate-800/20 transition-colors group">
                                                    <td className="py-6 pl-8 font-black text-slate-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                                            {income.source}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 text-slate-400 text-sm font-medium">{income.note || "-"}</td>
                                                    <td className="py-6 text-slate-400 text-sm font-medium">
                                                        <div className="flex items-center gap-2 opacity-60">
                                                            <Calendar size={14} />
                                                            {new Date(income.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 pr-8 text-right font-black text-emerald-400 text-lg">
                                                        +₹{income.amount.toLocaleString()}
                                                    </td>
                                                    <td className="py-6 pr-8 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleEdit(income)} className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button onClick={() => setDeleteId(income.id)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
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

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {filteredIncomes.map((income) => (
                                    <div key={income.id} className="glass-card p-5 rounded-3xl border border-slate-700/30 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 font-black shrink-0">
                                                    {income.source[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black">{income.source}</h4>
                                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold mt-0.5">
                                                        <Calendar size={10} />
                                                        {new Date(income.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-emerald-400 font-black text-lg">+₹{income.amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-xs font-medium bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">{income.note || "No note added"}</p>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button onClick={() => handleEdit(income)} className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-slate-700/30">
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button onClick={() => setDeleteId(income.id)} className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-red-500/20">
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
                            <h2 className="text-xl font-black text-white">{editId ? "Edit Income" : "Add New Income"}</h2>
                            <p className="text-slate-400 text-xs text-medium">Record a new payment received.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5 ml-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-bold"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5 ml-1">Source</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {sources.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, source: s })}
                                            className={`py-1.5 rounded-xl text-[10px] font-black transition-all border ${formData.source === s
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5 ml-1">Note (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                                    placeholder="What was this for?"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1.5 ml-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-black transition-all shadow-xl shadow-emerald-600/30 text-[11px] uppercase tracking-widest mt-2">
                                {editId ? "Update" : "Save"} Income
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Income"
                message="Are you sure you want to delete this income record?"
            />
        </div>
    );
};

export default IncomePage;
