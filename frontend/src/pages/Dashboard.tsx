import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, limit, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { TrendingDown, TrendingUp, Wallet, AlertTriangle, ChevronRight, PieChart } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import homeData from "../assets/animations/home.json";
import Skeleton from "../components/Skeleton";
import { Link } from "react-router-dom";

// Components
const StatCard = ({ icon: Icon, title, value, color, subtext }: any) => (
    <div className="glass-card p-5 md:p-6 rounded-3xl flex items-start justify-between hover-scale transition-all duration-300 relative overflow-hidden group border border-slate-700/30">
        <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-black uppercase tracking-widest">{title}</p>
            <h3 className="text-xl md:text-2xl font-black mt-1 text-slate-800 dark:text-white">{value}</h3>
            {subtext && <p className={`text-[10px] md:text-xs mt-1 font-bold ${color}`}>{subtext}</p>}
        </div>
        <div className={`p-2.5 md:p-3 rounded-2xl ${color.includes('emerald') ? 'bg-emerald-500/10 text-emerald-400' : color.includes('primary') ? 'bg-primary/10 text-primary' : color.includes('accent') ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-400'} relative z-10 shrink-0`}>
            <Icon size={20} className="md:w-6 md:h-6" />
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
            const incomeQuery = query(collection(db, "incomes"), where("userId", "==", user.uid));
            const incomeSnapshot = await getDocs(incomeQuery);
            const totalIncome = incomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            const expenseQuery = query(collection(db, "expenses"), where("userId", "==", user.uid));
            const expenseSnapshot = await getDocs(expenseQuery);
            const totalExpense = expenseSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            const recentExpenseQuery = query(
                collection(db, "expenses"),
                where("userId", "==", user.uid),
                limit(20)
            );
            const recentSnapshot = await getDocs(recentExpenseQuery);
            const recentExpenses = recentSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userDataFromFirestore = userDoc.data();
            const budget = userDataFromFirestore?.budget || 0;

            const savings = totalIncome - totalExpense;
            const budgetUsedPercentage = budget > 0 ? (totalExpense / budget) * 100 : 0;

            const insights = [];
            if (budget > 0 && budgetUsedPercentage >= 100) {
                insights.push({ type: 'error', message: "OVER EXCEEDED: You have surpassed your monthly budget limit!" });
            } else if (budget > 0 && budgetUsedPercentage > 90) {
                insights.push({ type: 'warning', message: "CAUTION: You've used over 90% of your monthly budget!" });
            } else if (savings < 0) {
                insights.push({ type: 'warning', message: "Your expenses exceed your income this month." });
            } else if (totalIncome > 0) {
                insights.push({ type: 'success', message: "Great job! You are maintaining a healthy balance." });
            }

            setData({
                summary: { totalIncome, totalExpense, savings, budget, budgetUsedPercentage },
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

    if (loading) return (
        <div className="space-y-8 pb-10">
            {/* Header Skeleton */}
            <div className="flex items-center gap-5">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            {/* Insight Skeleton */}
            <Skeleton className="h-16 w-full rounded-[1.5rem]" />

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <Skeleton className="h-28 rounded-3xl" />
                <Skeleton className="h-28 rounded-3xl" />
                <Skeleton className="h-28 rounded-3xl" />
                <Skeleton className="h-28 rounded-3xl" />
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <Skeleton className="h-[400px] rounded-[2.5rem]" />
                </div>
                <div className="lg:col-span-4">
                    <Skeleton className="h-[400px] rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="pb-10">
            <div className="flex items-center gap-5 mb-8">
                <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                    <LottieIcon animationData={homeData} size={48} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Welcome! Here's your financial overview.{data?.summary?.budget === 0 && " Before Starting your journey, let's set up your budget. View profile to update your budget."}
                    </p>
                </div>
            </div>

            {data.insights.length > 0 && (
                <div className={`p-4 md:p-5 rounded-[1.5rem] border flex items-center gap-4 mb-8 ${data.insights[0].type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    data.insights[0].type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    <AlertTriangle size={24} className="shrink-0" />
                    <p className="text-sm md:text-base font-black uppercase tracking-tight">{data.insights[0].message}</p>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8">
                <StatCard
                    icon={TrendingUp}
                    title="Income"
                    value={`₹${data.summary.totalIncome.toLocaleString()}`}
                    color="text-emerald-400"
                    subtext="All Time"
                />
                <StatCard
                    icon={TrendingDown}
                    title="Expense"
                    value={`₹${data.summary.totalExpense.toLocaleString()}`}
                    color="text-red-400"
                    subtext={data.summary.budget > 0 ? `${data.summary.budgetUsedPercentage.toFixed(0)}% of Budget` : "No Budget Active"}
                />
                <StatCard
                    icon={Wallet}
                    title="Savings"
                    value={`₹${data.summary.savings.toLocaleString()}`}
                    color="text-primary"
                    subtext="Available"
                />
                <StatCard
                    icon={PieChart}
                    title="Budget"
                    value={`₹${data.summary.budget.toLocaleString()}`}
                    color="text-accent"
                    subtext="Monthly Cap"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Activities */}
                <div className="lg:col-span-8">
                    <div className="glass-card rounded-[2.5rem] p-6 md:p-8 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Recent Activities</h2>
                            <Link to="/expenses" className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                View All <ChevronRight size={14} />
                            </Link>
                        </div>

                        {data.recentExpenses.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 font-medium">No recent expenses found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.recentExpenses.map((exp: any) => (
                                    <div key={exp.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-800/20 border border-slate-800/40 hover:bg-slate-800/40 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 font-black text-lg">
                                                {exp.category[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black">{exp.category}</h4>
                                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{new Date(exp.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-red-400 font-black text-lg">-₹{exp.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Growth Insights Card */}
                <div className="lg:col-span-4">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-primary/20 bg-gradient-to-br from-primary/10 via-slate-900 to-transparent relative overflow-hidden h-full group">
                        {/* Decorative Background Circles */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-1000" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-1000" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-16 h-16 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp size={32} strokeWidth={2.5} />
                            </div>

                            <h2 className="text-3xl font-black text-white leading-tight mb-4 uppercase tracking-tighter">
                                Growth <span className="text-primary">Mindset</span>
                            </h2>

                            <p className="text-slate-400 font-medium leading-relaxed mb-10 flex-grow">
                                Your savings are currently at <span className="text-white font-black text-lg">₹{data.summary.savings.toLocaleString()}</span>.
                                Keep tracking every rupee to unlock the true power of AI-driven wealth building.
                            </p>

                            <Link
                                to="/analytics"
                                className="group/btn relative overflow-hidden bg-white text-slate-900 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 text-center"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Analyze Master Trends <ChevronRight size={16} />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
