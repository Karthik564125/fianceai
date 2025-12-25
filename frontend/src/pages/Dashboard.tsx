import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, limit, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { TrendingDown, TrendingUp, Wallet, AlertTriangle } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import homeData from "../assets/animations/home.json";

// Components
const StatCard = ({ icon: Icon, title, value, color, subtext }: any) => (
    <div className="glass-card p-6 rounded-2xl flex items-start justify-between hover-scale transition-all duration-300 relative overflow-hidden group">
        <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{value}</h3>
            {subtext && <p className={`text-xs mt-1 ${color}`}>{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '500')}/10 ${color} relative z-10`}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        if (!user?.uid) return;
        try {
            // Fetch All Incomes
            const incomeQuery = query(collection(db, "incomes"), where("userId", "==", user.uid));
            const incomeSnapshot = await getDocs(incomeQuery);
            const totalIncome = incomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            // Fetch All Expenses
            const expenseQuery = query(collection(db, "expenses"), where("userId", "==", user.uid));
            const expenseSnapshot = await getDocs(expenseQuery);
            const totalExpense = expenseSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            // Fetch Recent Expenses - Removed orderBy to avoid index requirement
            const recentExpenseQuery = query(
                collection(db, "expenses"),
                where("userId", "==", user.uid),
                limit(20) // Fetch more to allow client-side sorting
            );
            const recentSnapshot = await getDocs(recentExpenseQuery);
            const recentExpenses = recentSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

            // Fetch User Budget from Profile
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userDataFromFirestore = userDoc.data();
            const budget = userDataFromFirestore?.budget || 0;

            const savings = totalIncome - totalExpense;
            const budgetUsedPercentage = (totalExpense / budget) * 100;

            // Generate Basic Insights
            const insights = [];
            if (budgetUsedPercentage > 90) {
                insights.push({ type: 'warning', message: "You've used over 90% of your monthly budget!" });
            } else if (savings < 0) {
                insights.push({ type: 'warning', message: "Your expenses exceed your income this month." });
            } else if (totalIncome > 0) {
                insights.push({ type: 'success', message: "Great job! You are maintaining a healthy balance." });
            }

            setData({
                summary: {
                    totalIncome,
                    totalExpense,
                    savings,
                    budget,
                    budgetUsedPercentage
                },
                recentExpenses,
                insights
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user?.uid]);

    if (loading) return <div className="text-white">Loading Dashboard...</div>;

    return (
        <div>
            <div className="mb-8 flex items-center gap-4">
                <div className="bg-teal-500/10 p-3 rounded-2xl">
                    <LottieIcon animationData={homeData} size={48} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Welcome! Here's your financial overview.</p>
                </div>
            </div>

            {/* Insights */}
            {data?.insights?.length > 0 && (
                <div className="mb-8 space-y-2">
                    {data.insights.map((insight: any, i: number) => (
                        <div key={i} className={`p-4 rounded-xl flex items-center gap-3 border ${insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                            insight.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' :
                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                            }`}>
                            <AlertTriangle size={20} />
                            <span>{insight.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Wallet}
                    title="Total Income"
                    value={`₹${(data?.summary?.totalIncome || 0).toLocaleString()}`}
                    color="text-emerald-400"
                    subtext="All Time"
                />
                <StatCard
                    icon={TrendingDown}
                    title="Total Expense"
                    value={`₹${(data?.summary?.totalExpense || 0).toLocaleString()}`}
                    color="text-red-400"
                    subtext={`${(data?.summary?.budgetUsedPercentage || 0).toFixed(0)}% of Budget`}
                />
                <StatCard
                    icon={TrendingUp}
                    title="Total Savings"
                    value={`₹${(data?.summary?.savings || 0).toLocaleString()}`}
                    color="text-blue-400"
                    subtext="Available Balance"
                />
                <StatCard
                    icon={Wallet}
                    title="Budget Limit"
                    value={`₹${(data?.summary?.budget || 0).toLocaleString()}`}
                    color="text-violet-400"
                    subtext="Monthly Cap"
                />
            </div>

            {/* Recent Activity */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Expenses</h3>
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                            <th className="pb-3 pl-2">Category</th>
                            <th className="pb-3">Description</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3 pr-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.recentExpenses?.length > 0 ? (
                            data.recentExpenses.map((expense: any) => (
                                <tr key={expense.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                                    <td className="py-4 pl-2 font-medium text-slate-200">{expense.category}</td>
                                    <td className="py-4 text-slate-400">{expense.description || "-"}</td>
                                    <td className="py-4 text-slate-400">{new Date(expense.date).toLocaleDateString()}</td>
                                    <td className="py-4 pr-2 text-right font-bold text-white">-₹{expense.amount}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500">No recent expenses found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
