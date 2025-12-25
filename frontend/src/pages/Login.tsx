import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import mainData from "../assets/animations/main.json";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error(err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
        ? "Invalid email or password"
        : "Login failed. Please check your credentials.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen bg-slate-900 relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 -z-10" />
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-5%] w-72 h-72 bg-teal-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      {/* Main Animation */}
      <div className="mb-6 w-48 h-48">
        <LottieIcon animationData={mainData} size={200} />
      </div>

      <div className="glass-card p-8 rounded-3xl w-full max-w-md relative z-10 border border-slate-700 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Welcome</h2>
          <p className="text-slate-400 mt-2">Sign in to continue to FinanceAI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Email Address</label>
            <input
              className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-white placeholder:text-slate-600"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-white placeholder:text-slate-600 pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] transition-all mt-4">
            Sign In
          </button>
        </form>
        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-teal-400 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
