import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LottieIcon from "./LottieIcon";
import ConfirmModal from "./ConfirmModal";

import mainData from "../assets/animations/main.json";
import homeData from "../assets/animations/home.json";
import expensesData from "../assets/animations/expenses.json";
import incomeData from "../assets/animations/income.json";
import upcomingData from "../assets/animations/upcoming.json";
import analyticsData from "../assets/animations/analytics.json";
import profileData from "../assets/animations/profile.json";
import aiData from "../assets/animations/ai.json";

interface SidebarProps {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const Sidebar = ({ mobileOpen, setMobileOpen }: SidebarProps) => {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                />
            )}

            <div className={`h-screen w-72 bg-slate-100 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col fixed left-0 top-0 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Logo Area */}
                <div className="p-8 pb-4 relative">
                    <div className="flex flex-col items-center gap-2 mb-8 relative z-10">
                        <div className="w-16 h-16 mb-1">
                            <LottieIcon animationData={mainData} size={64} />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary tracking-tighter">
                                FinanceAI
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold -mt-1 opacity-70">
                                Smart Wealth
                            </p>
                        </div>
                    </div>

                    {/* User Profile Snippet */}
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/40 rounded-2xl mb-2 shadow-sm dark:shadow-inner border border-slate-200 dark:border-slate-700/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 p-1">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <div className="bg-primary/20 rounded-full w-full h-full flex items-center justify-center">
                                    <LottieIcon animationData={user?.uid ? profileData : expensesData} size={32} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white truncate tracking-tight">
                                    {user?.fullName || user?.name || user?.displayName || "Guest"}
                                </h3>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate opacity-50"></p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {links.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-5 px-6 py-3 rounded-2xl font-black transition-all relative group ${isActive
                                    ? "bg-primary text-white shadow-xl shadow-primary/25 scale-[1.02]"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                                }`
                            }
                        >
                            <div className="w-7 h-7 flex items-center justify-center">
                                {(link as any).animation ? (
                                    <LottieIcon animationData={(link as any).animation} size={28} />
                                ) : (
                                    (link as any).icon
                                )}
                            </div>
                            <span className="tracking-wide text-base">{link.name}</span>
                            {link.path === pathname && (
                                <motion.div
                                    layoutId="sidebar-accent"
                                    className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full"
                                />
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="p-6 mt-auto border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-5 px-6 py-4 w-full rounded-2xl font-black transition-all text-red-500 hover:bg-red-500/10 text-lg"
                    >
                        <div className="w-8 h-8 flex items-center justify-center">
                            <LogOut size={28} />
                        </div>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={logout}
                confirmText="Logout"
                title="Logout Confirmation"
                message="Are you sure you want to log out of your account? You will need to sign in again to access your panel."
            />
        </>
    );
};

export default Sidebar;
