import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen relative overflow-hidden bg-slate-950 font-outfit">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-black -z-20" />
            <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-teal-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20 animate-blob -z-10" />
            <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20 animate-blob animation-delay-2000 -z-10" />

            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <div className="flex-1 flex flex-col transition-all duration-300 ml-0 md:ml-72 overflow-hidden h-screen relative z-0 w-full">
                {/* Mobile TopBar */}
                <TopBar />

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 md:pr-12 pb-24 md:pb-8">
                    <Outlet />
                </div>
            </div>

            {/* Mobile BottomNav */}
            <BottomNav />
        </div>
    );
};

export default Layout;
