import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import LottieIcon from "../components/LottieIcon";
import analyticsData from "../assets/animations/analytics.json";
import { Download, TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import * as XLSX from "xlsx";

// Premium Color Palette
const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

const Analytics = () => {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalyticsData = async () => {
        if (!user?.uid) return;
        try {
            // Fetch All Incomes
            const incomeQuery = query(collection(db, "incomes"), where("userId", "==", user.uid));
            const incomeSnapshot = await getDocs(incomeQuery);
            const totalIncome = incomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            // Fetch All Expenses
            const expenseQuery = query(collection(db, "expenses"), where("userId", "==", user.uid));
            const expenseSnapshot = await getDocs(expenseQuery);
            const expenses = expenseSnapshot.docs.map(doc => doc.data());
            const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

            // Calculate Category Stats
            const categoryMap: any = {};
            expenses.forEach(exp => {
                const cat = exp.category || "Other";
                categoryMap[cat] = (categoryMap[cat] || 0) + (exp.amount || 0);
            });

            const categoryStats = Object.keys(categoryMap)
                .map(cat => ({
                    name: cat,
                    value: categoryMap[cat]
                }))
                .sort((a, b) => b.value - a.value);

            setData({
                summary: { totalIncome, totalExpense },
                categoryStats
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, [user?.uid]);

    const downloadExcel = () => {
        if (!data) return;

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryData = [
            ["Financial Summary"],
            [""],
            ["Metric", "Amount (₹)"],
            ["Total Income", data.summary.totalIncome],
            ["Total Expense", data.summary.totalExpense],
            ["Net Savings", data.summary.totalIncome - data.summary.totalExpense],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

        // Category Breakdown Sheet
        if (data.categoryStats.length > 0) {
            const categoryData = [
                ["Expense by Category"],
                [""],
                ["Category", "Amount (₹)", "Percentage"],
                ...data.categoryStats.map((cat: any) => [
                    cat.name,
                    cat.value,
                    `${((cat.value / data.summary.totalExpense) * 100).toFixed(2)}%`
                ])
            ];
            const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
            XLSX.utils.book_append_sheet(wb, categorySheet, "Categories");
        }

        // Download
        XLSX.writeFile(wb, `FinanceAI_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <p className="text-primary text-lg">Loading analytics...</p>
        </div>
    );

    const expenseVsIncome = [
        { name: "Income", amount: data.summary.totalIncome },
        { name: "Expense", amount: data.summary.totalExpense },
    ];

    const savings = data.summary.totalIncome - data.summary.totalExpense;
    const savingsRate = data.summary.totalIncome > 0 ? ((savings / data.summary.totalIncome) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                        <LottieIcon animationData={analyticsData} size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Analytics</h1>
                        <p className="text-slate-500 dark:text-slate-400">Deep dive into your financial habits.</p>
                    </div>
                </div>
                <button
                    onClick={downloadExcel}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Download size={18} />
                    Download Excel
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm font-medium">Total Income</p>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <TrendingUp size={20} className="text-emerald-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-white">₹{data.summary.totalIncome.toLocaleString()}</h3>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-red-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm font-medium">Total Expense</p>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <TrendingDown size={20} className="text-red-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-white">₹{data.summary.totalExpense.toLocaleString()}</h3>
                </div>

                <div className={`glass-card p-6 rounded-2xl border ${savings >= 0 ? 'border-primary/20' : 'border-red-500/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm font-medium">Net Savings</p>
                        <div className={`p-2 rounded-lg ${savings >= 0 ? 'bg-primary/10' : 'bg-red-500/10'}`}>
                            <Wallet size={20} className={savings >= 0 ? 'text-primary' : 'text-red-400'} />
                        </div>
                    </div>
                    <h3 className={`text-2xl font-black ${savings >= 0 ? 'text-primary' : 'text-red-400'}`}>
                        ₹{Math.abs(savings).toLocaleString()}
                    </h3>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-accent/20">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm font-medium">Savings Rate</p>
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Target size={20} className="text-accent" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-white">{savingsRate}%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Spending Overview */}
                <div className="glass-card p-6 rounded-3xl">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Spending Overview</h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={expenseVsIncome}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff' }}
                                    cursor={{ fill: '#334155' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="amount" fill="#14b8a6" radius={[8, 8, 0, 0]} barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Categories */}
                <div className="glass-card p-6 rounded-3xl">
                    <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700 pb-2">Expense by Category</h2>
                    <div className="h-72 w-full flex items-center justify-center">
                        {data.categoryStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.categoryStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.categoryStats.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff' }} />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ color: '#cbd5e1' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-slate-500">
                                <p>No expense data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Spending Categories */}
            {data.categoryStats.length > 0 && (
                <div className="glass-card p-6 rounded-3xl">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2">Top Spending Categories</h2>
                    <div className="space-y-4">
                        {data.categoryStats.slice(0, 5).map((cat: any, index: number) => {
                            const percentage = ((cat.value / data.summary.totalExpense) * 100).toFixed(1);
                            return (
                                <div key={cat.name} className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-white font-bold">{cat.name}</span>
                                                <span className="text-slate-400 text-sm">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: COLORS[index % COLORS.length]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-white font-black text-lg min-w-[120px] text-right">₹{cat.value.toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Financial Insights */}
            <div className="glass-card p-6 rounded-3xl border border-primary/20">
                <h2 className="text-xl font-bold text-white mb-4">💡 Financial Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savings >= 0 ? (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <p className="text-emerald-400 font-bold mb-1">✅ Great Job!</p>
                            <p className="text-slate-300 text-sm">You're saving {savingsRate}% of your income. Keep up the good work!</p>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 font-bold mb-1">⚠️ Budget Alert</p>
                            <p className="text-slate-300 text-sm">Your expenses exceed income by ₹{Math.abs(savings).toLocaleString()}. Consider reducing spending.</p>
                        </div>
                    )}

                    {data.categoryStats.length > 0 && (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                            <p className="text-primary font-bold mb-1">📊 Top Category</p>
                            <p className="text-slate-300 text-sm">
                                {data.categoryStats[0].name} is your highest expense at ₹{data.categoryStats[0].value.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
