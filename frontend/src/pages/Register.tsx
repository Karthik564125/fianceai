import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const validatePassword = (pwd: string) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return re.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(formData.password)) {
      toast.error("Password must contain at least 8 chars, 1 uppercase, 1 lowercase, and 1 special char.");
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Save additional profile data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        createdAt: new Date().toISOString()
      });

      toast.success("Registration successful!");
      navigate("/");
    } catch (err: any) {
      console.error("Registration Error:", err);
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen bg-slate-950 relative overflow-hidden text-white"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-teal-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <div className="glass-card p-8 rounded-3xl w-full max-w-md relative z-10 border border-slate-700 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Create Account</h2>
          <p className="text-slate-400 mt-2">Join us to manage your finances smarter.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Full Name</label>
            <input
              className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-white placeholder:text-slate-600"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* ... existing fields for email, phone, dob, password ... */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Email Address</label>
            <input
              className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-white placeholder:text-slate-600"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Phone</label>
              <input
                className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-white placeholder:text-slate-600"
                type="tel"
                placeholder="1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">DOB</label>
              <input
                className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-white placeholder:text-slate-600"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-white placeholder:text-slate-600 pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 Upper, 1 Special"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <button className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] transition-all mt-4">
            Sign Up
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
