import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import mainData from "../assets/animations/main.json";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../services/cloudinary";
import { Camera, Loader2 } from "lucide-react";

export default function Login() {
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

    // Redirect if already logged in
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
            reader.onloadend = () => {
                setRegImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            let photoURL = "";
            if (regImage) {
                photoURL = await uploadImage(regImage);
            }

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

            setUser({
                uid: userCredential.user.uid,
                ...userData
            });

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
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 -z-10" />
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />

            {/* Header with Animation */}
            <div className="text-center mb-12 z-10">
                <div className="w-32 h-32 mx-auto mb-4">
                    <LottieIcon animationData={mainData} size={150} />
                </div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
                    FinanceAI
                </h1>
                <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">Smart Wealth Management Portfolio</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl z-10">
                {/* Left: Login */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 rounded-3xl border border-slate-800 flex flex-col justify-center transition-all duration-300"
                >
                    <h2 className="text-2xl font-bold mb-6 text-primary">Sign In</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                            <input
                                className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-primary outline-none transition-all"
                                type="email"
                                placeholder="karthik@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-primary outline-none transition-all pr-10"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className="absolute right-3 top-4 text-slate-500" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="button" onClick={handleForgotPassword} className="text-xs text-primary hover:underline">Forgot Password?</button>
                        <button className="w-full bg-primary hover:bg-primary/90 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                            Login to Account
                        </button>
                    </form>
                </motion.div>

                {/* Middle: About Us */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-8 rounded-3xl border border-slate-700 bg-gradient-to-b from-slate-900/40 to-primary/10 flex flex-col items-center text-center justify-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-y-1/2" />
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">About FinanceAI</h2>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                        Your intelligent companion for mastering personal finance. Track every penny, set smart budgets, and get AI-powered investment advice tailored just for you.
                    </p>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="p-3 bg-slate-900/80 rounded-2xl border border-primary/20">
                            <span className="text-primary font-bold block">AI Insights</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Powered by Gemini</span>
                        </div>
                        <div className="p-3 bg-slate-900/80 rounded-2xl border border-primary/20">
                            <span className="text-primary font-bold block">Secure</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Firebase Shield</span>
                        </div>
                    </div>
                    <div className="mt-8 text-primary/40 text-sm italic font-serif italic">
                        "Empowering your financial freedom."
                    </div>
                </motion.div>

                {/* Right: Sign Up */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8 rounded-3xl border border-slate-800"
                >
                    <h2 className="text-2xl font-bold mb-6 text-accent">Join Us</h2>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleRegImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 group-hover:border-accent overflow-hidden flex items-center justify-center bg-slate-900/50 transition-colors">
                                    {regImagePreview ? (
                                        <img src={regImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-slate-500 group-hover:text-accent transition-colors" size={24} />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-accent p-1.5 rounded-full text-white shadow-lg pointer-events-none">
                                    <Camera size={12} />
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Photo (Optional)</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                            <input
                                className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all"
                                type="text"
                                placeholder="Karthik Raj"
                                value={regData.name}
                                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                            <input
                                className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all"
                                type="email"
                                placeholder="raj@finance.ai"
                                value={regData.email}
                                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone</label>
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all"
                                    type="tel"
                                    value={regData.phone}
                                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">DOB</label>
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all text-sm"
                                    type="date"
                                    value={regData.dob}
                                    onChange={(e) => setRegData({ ...regData, dob: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-800 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-accent outline-none transition-all pr-10"
                                    type={showRegPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={regData.password}
                                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                                    required
                                />
                                <button type="button" className="absolute right-3 top-4 text-slate-500" onClick={() => setShowRegPassword(!showRegPassword)}>
                                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button
                            disabled={regLoading}
                            className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent hover:to-primary py-3.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all active:scale-95 mt-2 flex items-center justify-center gap-2"
                        >
                            {regLoading ? <Loader2 size={20} className="animate-spin" /> : "Start My Journey"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
