import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, User, LogOut, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LottieIcon from "./LottieIcon";
import ConfirmModal from "./ConfirmModal";
import mainData from "../assets/animations/main.json";

const TopBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            <div className="md:hidden sticky top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 z-50 flex items-center justify-between px-4">
                {/* Left side: Logo & Branding */}
                <div className="flex items-center gap-2" onClick={() => navigate("/")}>
                    <div className="w-8 h-8">
                        <LottieIcon animationData={mainData} size={32} />
                    </div>
                    <h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tighter">
                        SpendWise
                    </h1>
                </div>

                {/* Right side: Quick Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => navigate("/about")}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        title="About Us"
                    >
                        <Info size={18} />
                    </button>
                    <button
                        onClick={() => navigate("/analytics")}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        title="Analytics"
                    >
                        <BarChart2 size={18} />
                    </button>
                    <button
                        onClick={() => navigate("/profile")}
                        className="p-1 px-1.5 flex items-center justify-center"
                        title="Profile"
                    >
                        {user?.photoURL ? (
                            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-primary/30">
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <User size={18} className="text-slate-400 hover:text-primary transition-colors" />
                        )}
                    </button>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={logout}
                confirmText="Logout"
                title="Logout"
                message="Are you sure you want to logout? You will need to sign in again to access your account."
            />
        </>
    );
};

export default TopBar;
