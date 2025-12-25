import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../context/ThemeContext"; // Removed theme context
import LottieIcon from "./LottieIcon";

import homeData from "../assets/animations/home.json";
import expensesData from "../assets/animations/expenses.json";
import incomeData from "../assets/animations/income.json";
import upcomingData from "../assets/animations/upcoming.json";
import analyticsData from "../assets/animations/analytics.json";
import profileData from "../assets/animations/profile.json";
import aiData from "../assets/animations/ai.json";
import mainData from "../assets/animations/main.json";
import userData from "../assets/animations/user.json";

const Sidebar = () => {
    const { pathname } = useLocation();
    const { user } = useAuth();


    const links = [
        { name: "Dashboard", path: "/", animation: homeData },
        { name: "Expenses", path: "/expenses", animation: expensesData },
        { name: "Income", path: "/income", animation: incomeData },
        { name: "Upcoming", path: "/upcoming", animation: upcomingData },
        { name: "Analytics", path: "/analytics", animation: analyticsData },
        { name: "AI Chatbot", path: "/chatbot", animation: aiData },
        { name: "Profile", path: "/profile", animation: profileData },
        { name: "About Us", path: "/about", icon: <Info size={24} /> },
    ];

    return (
        <div className="h-screen w-64 bg-slate-100 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col fixed left-0 top-0 transition-colors duration-300">
            {/* Logo Area */}
            <div className="p-6 relative">
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="absolute -top-6 -left-6 w-32 h-32 opacity-20 pointer-events-none">
                        <div className="w-full h-full bg-teal-500 rounded-full blur-3xl animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                        FinanceAI
                    </h1>
                </div>

                {/* Animated Graphic */}
                <div className="-ml-6 -mt-8 mb-4 w-40 opacity-90">
                    <LottieIcon animationData={mainData} size={160} />
                </div>

                {/* User Profile Snippet */}
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/50 rounded-xl mb-2 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700/50 mt-[-20px]">
                    <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center overflow-hidden border border-teal-500/20">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <LottieIcon animationData={userData} size={40} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-slate-800 dark:text-white">{user?.fullName || user?.displayName || "User"}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all relative group ${isActive
                                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                            }`
                        }
                    >
                        <div className="w-6 h-6 flex items-center justify-center">
                            {link.animation ? (
                                <LottieIcon animationData={link.animation} size={24} />
                            ) : (
                                link.icon
                            )}
                        </div>
                        <span className="tracking-wide">{link.name}</span>
                        {link.path === pathname && (
                            <motion.div
                                layoutId="sidebar-accent"
                                className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                            />
                        )}
                    </NavLink>
                ))}
            </div>

        </div>
    );
};

export default Sidebar;
