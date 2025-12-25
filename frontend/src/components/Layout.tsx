import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
    return (
        <div className="flex min-h-screen relative overflow-hidden bg-slate-950 font-outfit">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-black -z-20" />
            <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-teal-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20 animate-blob -z-10" />
            <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20 animate-blob animation-delay-2000 -z-10" />

            <Sidebar />
            <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative z-0">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
