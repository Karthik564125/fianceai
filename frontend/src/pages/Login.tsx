import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Camera, Loader2, ArrowLeft, LogIn, UserPlus } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import mainData from "../assets/animations/main.json";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../services/cloudinary";

type View = "initial" | "login" | "register";

export default function Login() {
    const [view, setView] = useState<View>("initial");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Registration states
    const [regData, setRegData] = useState({ name: "", email: "", password: "", dob: "", phone: "" });
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [regImage, setRegImage] = useState<File | null>(null);
    const [regImagePreview, setRegImagePreview] = useState<string | null>(null);
    const [regLoading, setRegLoading] = useState(false);
    const { user, setUser, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            navigate("/", { replace: true });
        }
    }, [user, loading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back!");
            navigate("/", { replace: true });
        } catch (err: any) {
            toast.error("Login failed. Check your credentials.");
        }
    };

    const handleRegImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setRegImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setRegImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            let photoURL = "";
            if (regImage) photoURL = await uploadImage(regImage);

            const userCredential = await createUserWithEmailAndPassword(auth, regData.email, regData.password);
            const userData = {
                fullName: regData.name,
                email: regData.email,
                phone: regData.phone,
                dob: regData.dob,
                photoURL: photoURL,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, "users", userCredential.user.uid), userData);
            setUser({ uid: userCredential.user.uid, ...userData });
            toast.success("Account created!");
            navigate("/", { replace: true });
        } catch (err: any) {
            toast.error(err.message || "Registration failed");
        } finally {
            setRegLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Please enter your email first.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Reset email sent!");
        } catch (err: any) {
            toast.error("Failed to send reset email");
        }
    };

    return (
        <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 md:px-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 -z-10" />
            <div className="absolute top-[-10%] left-[-5%] w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-64 md:w-96 h-64 md:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />

            <div className="w-full max-w-sm z-10 transition-all duration-500">
                <AnimatePresence mode="wait">
                    {view === "initial" && (
                        <motion.div
                            key="initial"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <LottieIcon animationData={mainData} size={64} />
                                <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-none">
                                    SpendWise
                                </h1>
                            </div>

                            <h2 className="text-xl font-bold mb-4 text-slate-200">Take Control of Your Wealth</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                                The intelligent companion for mastering personal finance. Track spending, set smart budgets, and grow your net worth with AI guidance.
                            </p>

                            <div className="flex flex-col w-full gap-4">
                                <button
                                    onClick={() => setView("login")}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    <LogIn size={18} /> Sign In to Panel
                                </button>
                                <button
                                    onClick={() => setView("register")}
                                    className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    <UserPlus size={18} /> Create New Account
                                </button>
                            </div>

                            <p className="mt-8 text-[10px] text-slate-600 uppercase font-black tracking-widest">
                                Organize your finance, plan your future, and live your best life.
                            </p>
                        </motion.div>
                    )}

                    {view === "login" && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card p-6 rounded-[2.5rem] border border-slate-800 w-full relative"
                        >
                            <button
                                onClick={() => setView("initial")}
                                className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div className="flex flex-col items-center mb-8">
                                <div className="p-3 bg-primary/10 rounded-2xl mb-3">
                                    <LogIn className="text-primary" size={24} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Welcome Back</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">SpendWise Portal Access</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Email Address</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-2xl mt-1.5 focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                                        <button type="button" onClick={handleForgotPassword} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">Forgot?</button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-2xl mt-1.5 focus:ring-2 focus:ring-primary outline-none transition-all pr-12 text-sm font-medium"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 mt-0.5" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button className="w-full bg-primary hover:bg-primary/90 py-4 rounded-2xl font-black tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase text-xs mt-2">
                                    Authorize & Login
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {view === "register" && (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card p-6 rounded-[2.5rem] border border-slate-800 w-full relative"
                        >
                            <button
                                onClick={() => setView("initial")}
                                className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div className="flex flex-col items-center mb-6">
                                <div className="p-3 bg-accent/10 rounded-2xl mb-3">
                                    <UserPlus className="text-accent" size={24} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Create Identity</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Join the SpendWise network</p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-3.5">
                                <div className="flex flex-col items-center mb-2">
                                    <div className="relative group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleRegImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 group-hover:border-accent overflow-hidden flex items-center justify-center bg-slate-950 transition-colors">
                                            {regImagePreview ? (
                                                <img src={regImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="text-slate-500 group-hover:text-accent transition-colors" size={20} />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-accent p-1.5 rounded-full text-white shadow-lg pointer-events-none">
                                            <Camera size={10} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Full Legal Name</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all text-xs font-medium"
                                        type="text"
                                        placeholder="John Doe"
                                        value={regData.name}
                                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Email Address</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all text-xs font-medium"
                                        type="email"
                                        placeholder="john@finance.ai"
                                        value={regData.email}
                                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Phone</label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all text-xs font-medium"
                                            type="tel"
                                            value={regData.phone}
                                            onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">DOB</label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all text-xs font-medium"
                                            type="date"
                                            value={regData.dob}
                                            onChange={(e) => setRegData({ ...regData, dob: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Security Password</label>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all pr-12 text-xs font-medium"
                                            type={showRegPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={regData.password}
                                            onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                                            required
                                        />
                                        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 mt-0.5" onClick={() => setShowRegPassword(!showRegPassword)}>
                                            {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    disabled={regLoading}
                                    className="w-full bg-gradient-to-r from-accent to-primary py-4 rounded-2xl font-black tracking-widest shadow-xl shadow-accent/20 transition-all active:scale-95 text-[11px] uppercase mt-2 flex items-center justify-center gap-2"
                                >
                                    {regLoading ? <Loader2 size={18} className="animate-spin" /> : "Initiate Setup"}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
