import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen relative overflow-hidden bg-slate-950 font-outfit">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-black -z-20" />
            <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-teal-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20 animate-blob -z-10" />
            <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20 animate-blob animation-delay-2000 -z-10" />

            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <div className="flex-1 transition-all duration-300 ml-0 md:ml-72 p-4 md:p-8 md:pr-12 overflow-y-auto h-screen relative z-0 w-full md:max-w-[calc(100vw-18rem)]">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden mb-4 p-2 bg-slate-800/50 rounded-xl text-white border border-slate-700/50 backdrop-blur-md"
                >
                    <Menu size={24} />
                </button>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
