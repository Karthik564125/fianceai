import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import LottieIcon from "../components/LottieIcon";
import analyticsData from "../assets/animations/analytics.json";
import { Download, TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import Skeleton from "../components/Skeleton";
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
            const incomes = incomeSnapshot.docs.map(doc => doc.data());
            const totalIncome = incomes.reduce((sum: number, doc: any) => sum + (doc.amount || 0), 0);

            // Fetch All Expenses
            const expenseQuery = query(collection(db, "expenses"), where("userId", "==", user.uid));
            const expenseSnapshot = await getDocs(expenseQuery);
            const expenses = expenseSnapshot.docs.map(doc => doc.data());
            const totalExpense = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);

            // Calculate Category Stats
            const categoryMap: any = {};
            expenses.forEach((exp: any) => {
                const cat = exp.category || "Other";
                categoryMap[cat] = (categoryMap[cat] || 0) + (exp.amount || 0);
            });

            const categoryStats = Object.keys(categoryMap)
                .map(cat => ({
                    name: cat,
                    value: categoryMap[cat]
                }))
                .sort((a, b) => b.value - a.value);

            // Calculate Monthly Trends (Last 6 Months)
            const monthlyData: any = {};
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthYear = d.toLocaleString('default', { month: 'short' });
                months.push(monthYear);
                monthlyData[monthYear] = { month: monthYear, income: 0, expense: 0 };
            }

            incomes.forEach((inc: any) => {
                if (!inc.date) return;
                const m = new Date(inc.date).toLocaleString('default', { month: 'short' });
                if (monthlyData[m]) monthlyData[m].income += inc.amount;
            });

            expenses.forEach((exp: any) => {
                if (!exp.date) return;
                const m = new Date(exp.date).toLocaleString('default', { month: 'short' });
                if (monthlyData[m]) monthlyData[m].expense += exp.amount;
            });

            const trendData = months.map(m => monthlyData[m]);

            setData({
                summary: { totalIncome, totalExpense },
                categoryStats,
                trendData
            });
        } catch (err) {
            console.error("Analytics Error:", err);
            // Even on error, set some default data so page isn't black
            setData({ summary: { totalIncome: 0, totalExpense: 0 }, categoryStats: [], trendData: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, [user?.uid]);

    const downloadExcel = () => {
        if (!data) return;
        const wb = XLSX.utils.book_new();
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
        XLSX.writeFile(wb, `SpendWise_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading || !data) return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Skeleton className="h-28 rounded-3xl" />
                <Skeleton className="h-28 rounded-3xl" />
                <Skeleton className="h-28 rounded-3xl" />
                <Skeleton className="h-28 rounded-3xl" />
            </div>
            <Skeleton className="h-[450px] w-full rounded-[3rem]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-[400px] rounded-[2.5rem]" />
                <Skeleton className="h-[400px] rounded-[2.5rem]" />
            </div>
        </div>
    );

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
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight tracking-tighter">Analytics</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Deep dive into your financial habits.</p>
                    </div>
                </div>
                <button
                    onClick={downloadExcel}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
                >
                    <Download size={18} />
                    Download Excel
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    icon={TrendingUp}
                    title="Total Revenue"
                    value={`₹${data.summary.totalIncome.toLocaleString()}`}
                    color="text-emerald-400"
                    bg="border-emerald-500/20"
                />
                <StatCard
                    icon={TrendingDown}
                    title="Total Spend"
                    value={`₹${data.summary.totalExpense.toLocaleString()}`}
                    color="text-red-400"
                    bg="border-red-500/20"
                />
                <StatCard
                    icon={Wallet}
                    title="Net Worth"
                    value={`₹${Math.abs(savings).toLocaleString()}`}
                    color={savings >= 0 ? "text-primary" : "text-red-400"}
                    bg={savings >= 0 ? "border-primary/20" : "border-red-500/20"}
                />
                <StatCard
                    icon={Target}
                    title="Saving Efficiency"
                    value={`${savingsRate}%`}
                    color="text-accent"
                    bg="border-accent/20"
                />
            </div>

            {/* Monthly Trend Chart */}
            <div className="glass-card p-6 md:p-10 rounded-[3rem] border border-slate-700/30 bg-slate-900/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Growth Trends</h2>
                        <p className="text-slate-500 text-sm font-medium">Financial trajectory over the last 6 months</p>
                    </div>
                    <div className="flex items-center gap-6 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Expense</span>
                        </div>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.trendData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }}
                                tickFormatter={(value) => `₹${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '24px', border: '1px solid #334155', background: '#0f172a', padding: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                itemStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}
                                cursor={{ stroke: '#334155', strokeWidth: 2 }}
                            />
                            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" animationDuration={2000} />
                            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" animationDuration={2000} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Spending by Category (Pie) */}
                <div className="glass-card p-8 rounded-[2.5rem]">
                    <h2 className="text-xl font-black mb-8 text-white border-b border-slate-700/50 pb-4 uppercase tracking-tighter">Expense Distribution</h2>
                    <div className="h-72 w-full flex items-center justify-center">
                        {data.categoryStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.categoryStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.categoryStats.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', background: '#1e293b', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                                    <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" wrapperStyle={{ color: '#cbd5e1', paddingTop: '30px', fontSize: '12px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-slate-600">
                                <p className="font-bold">No expenditure data found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Spending Categories (Progress Bars) */}
                <div className="glass-card p-8 rounded-[2.5rem]">
                    <h2 className="text-xl font-black text-white mb-8 border-b border-slate-700/50 pb-4 uppercase tracking-tighter">Top Categories</h2>
                    <div className="space-y-6">
                        {data.categoryStats.length > 0 ? (
                            data.categoryStats.slice(0, 5).map((cat: any, index: number) => {
                                const percentage = ((cat.value / data.summary.totalExpense) * 100).toFixed(1);
                                return (
                                    <div key={cat.name} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-white font-black text-xs uppercase tracking-widest">{cat.name}</span>
                                            </div>
                                            <span className="text-slate-400 font-bold text-xs uppercase">₹{cat.value.toLocaleString()} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}44` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20 text-slate-600">
                                <p className="font-bold italic">Start spending to see your stats!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Financial Insights */}
            <div className="glass-card p-8 md:p-10 rounded-[3.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-slate-950 to-transparent">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                        <Target size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">AI Financial Insights</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savings >= 0 ? (
                        <InsightBox
                            icon={TrendingUp}
                            title="Surplus Detected"
                            message={`You've saved ${savingsRate}% of your total revenue. Your current surplus is ₹${savings.toLocaleString()}. Excellent work!`}
                            color="emerald"
                        />
                    ) : (
                        <InsightBox
                            icon={TrendingDown}
                            title="Budget Overdraft"
                            message={`Caution: Your outgoings exceed your income by ₹${Math.abs(savings).toLocaleString()}. This is a high-risk zone.`}
                            color="red"
                        />
                    )}

                    {data.categoryStats.length > 0 && (
                        <InsightBox
                            icon={Wallet}
                            title="Primary Expense"
                            message={`${data.categoryStats[0].name} accounts for the largest portion of your spending. Focus here to optimize your budget.`}
                            color="primary"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ icon: Icon, title, value, color, bg }: any) => (
    <div className={`glass-card p-6 rounded-[2rem] border ${bg} hover-scale transition-all duration-300 shadow-2xl shadow-black/20`}>
        <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">{title}</p>
            <div className={`p-2 rounded-xl ${color.replace('text', 'bg')}/10`}>
                <Icon size={18} className={color} />
            </div>
        </div>
        <h3 className={`text-xl md:text-2xl font-black text-white tracking-tighter`}>{value}</h3>
    </div>
);

const InsightBox = ({ icon: Icon, title, message, color }: any) => {
    const colorClasses: any = {
        emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold",
        red: "bg-red-500/10 border-red-500/20 text-red-400 font-bold",
        primary: "bg-primary/10 border-primary/20 text-primary font-bold"
    };
    return (
        <div className={`p-6 rounded-[2rem] border flex items-start gap-4 ${colorClasses[color] || ""}`}>
            <div className={`p-2 rounded-xl bg-current/10 shrink-0`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-1 opacity-80">{title}</p>
                <p className="text-slate-200 text-sm leading-relaxed font-medium">{message}</p>
            </div>
        </div>
    );
};

export default Analytics;
