import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import LottieIcon from "../components/LottieIcon";
import analyticsData from "../assets/animations/analytics.json";

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

            const categoryStats = Object.keys(categoryMap).map(cat => ({
                name: cat,
                value: categoryMap[cat]
            }));

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

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <p className="text-teal-600 text-lg">Loading analytics...</p>
        </div>
    );

    const expenseVsIncome = [
        { name: "Income", amount: data.summary.totalIncome },
        { name: "Expense", amount: data.summary.totalExpense },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-3 rounded-2xl">
                    <LottieIcon animationData={analyticsData} size={40} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400">Deep dive into your financial habits.</p>
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
                                <Bar dataKey="amount" fill="#0d9488" radius={[8, 8, 0, 0]} barSize={60} />
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
        </div>
    );
};

export default Analytics;
