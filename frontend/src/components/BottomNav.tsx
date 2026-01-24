import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, IndianRupee, MessageSquare, Calendar } from "lucide-react";

const BottomNav = () => {
    const navLinks = [
        { name: "Home", path: "/", icon: LayoutDashboard },
        { name: "Expenses", path: "/expenses", icon: Receipt },
        { name: "Income", path: "/income", icon: IndianRupee },
        { name: "AI Chat", path: "/chatbot", icon: MessageSquare },
        { name: "Upcoming", path: "/upcoming", icon: Calendar },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-2xl border-t border-slate-800/50 z-[60] flex items-center justify-around px-2 md:hidden">
            {navLinks.map((link) => (
                <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-slate-500"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{link.name}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    );
};

export default BottomNav;
